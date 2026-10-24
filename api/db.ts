/**
 * API do "banco de dados" — função serverless da Vercel (rota: /api/db).
 *
 * O banco é um único arquivo JSON num Vercel Blob privado (precificafardo-db.json).
 *
 *   GET  /api/db  -> { data: { version, savedAt, products, settings, customers } | null }
 *   PUT  /api/db  -> grava produtos, configurações e clientes e responde { savedAt }
 *
 * Variáveis de ambiente (veja .env.example):
 *   APP_PASSWORD            senha de acesso ao app
 *   BLOB_STORE_ID           identificador do Blob; autenticação OIDC gerenciada pela Vercel
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import { get, put } from '@vercel/blob';

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): unknown;
  json(body: unknown): unknown;
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const MAX_PAYLOAD_BYTES = 2_000_000;
const MAX_PRODUCTS = 5000;
const MAX_CUSTOMERS = 10000;

/* ---------------------------------- auth ---------------------------------- */

const sha256 = (value: string) => createHash('sha256').update(value).digest();

async function authorize(req: ApiRequest): Promise<void> {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    throw new HttpError(500, 'A variável APP_PASSWORD não está configurada no servidor.');
  }

  const header = req.headers['x-app-password'];
  const encoded = Array.isArray(header) ? header[0] : header;
  let provided = '';
  try {
    provided = encoded ? decodeURIComponent(encoded) : '';
  } catch {
    provided = '';
  }

  if (!timingSafeEqual(sha256(provided), sha256(expected))) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // freia tentativa por força bruta
    throw new HttpError(401, 'Senha incorreta.');
  }
}

/* ------------------------------ Vercel Blob ------------------------------ */

const DB_PATHNAME = 'precificafardo-db.json';

interface StoredDb {
  version: number;
  savedAt: number;
  products: unknown[];
  settings: Record<string, unknown>;
  customers?: unknown[];
}

function storageError(error: unknown, action: string): HttpError {
  const detail = error instanceof Error ? error.message : String(error);
  if (/token|store id|credential|unauthori[sz]ed|forbidden/i.test(detail)) {
    return new HttpError(
      500,
      'O armazenamento não está configurado. Crie um Blob store (acesso Private) no painel da Vercel e conecte-o ao projeto para configurar BLOB_STORE_ID e a autenticação OIDC.'
    );
  }
  return new HttpError(502, `Falha ao ${action}: ${detail}`);
}

async function readDb(): Promise<StoredDb | null> {
  let text: string;
  try {
    // useCache:false = sempre a versão mais recente (sem esperar o cache da CDN)
    const result = await get(DB_PATHNAME, { access: 'private', useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null; // ainda não existe
    text = (await new Response(result.stream).text()).trim();
  } catch (error) {
    throw storageError(error, 'ler os dados');
  }
  if (!text) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new HttpError(502, 'O arquivo de dados está corrompido (JSON inválido).');
  }

  const db = parsed as Partial<StoredDb> | null;
  if (!db || typeof db !== 'object' || !Array.isArray(db.products)) return null;

  return {
    version: typeof db.version === 'number' ? db.version : 1,
    savedAt: typeof db.savedAt === 'number' ? db.savedAt : 0,
    products: db.products,
    settings: db.settings && typeof db.settings === 'object' ? db.settings : {},
    customers: Array.isArray(db.customers) ? db.customers : [],
  };
}

async function writeDb(db: StoredDb): Promise<void> {
  try {
    await put(DB_PATHNAME, JSON.stringify(db), {
      access: 'private',
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: 'application/json',
    });
  } catch (error) {
    throw storageError(error, 'gravar os dados');
  }
}

/* --------------------------------- handler --------------------------------- */

function parseBody(body: unknown): Record<string, unknown> | null {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    await authorize(req);

    if (req.method === 'GET') {
      return res.status(200).json({ data: await readDb() });
    }

    if (req.method === 'PUT') {
      const body = parseBody(req.body);
      if (!body || !Array.isArray(body.products)) {
        throw new HttpError(400, 'Dados inválidos: esperado { products: [], settings: {} }.');
      }
      if (body.products.length > MAX_PRODUCTS) {
        throw new HttpError(400, `Limite de ${MAX_PRODUCTS} produtos excedido.`);
      }
      if (body.customers !== undefined && !Array.isArray(body.customers)) {
        throw new HttpError(400, 'Dados inválidos: customers deve ser uma lista.');
      }
      if (Array.isArray(body.customers) && body.customers.length > MAX_CUSTOMERS) {
        throw new HttpError(400, `Limite de ${MAX_CUSTOMERS} clientes excedido.`);
      }

      const existingDb = body.customers === undefined ? await readDb() : null;
      const db: StoredDb = {
        version: 1,
        savedAt: Date.now(),
        products: body.products,
        settings: body.settings && typeof body.settings === 'object' ? (body.settings as Record<string, unknown>) : {},
        customers: Array.isArray(body.customers) ? body.customers : existingDb?.customers ?? [],
      };
      if (Buffer.byteLength(JSON.stringify(db)) > MAX_PAYLOAD_BYTES) {
        throw new HttpError(413, 'Dados grandes demais.');
      }

      await writeDb(db);
      return res.status(200).json({ savedAt: db.savedAt });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Erro inesperado em /api/db:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
