export class Http {
  static getHeaders(request: Request) {
    const headers: Record<string, string> = {};

    for (const [key, value] of request.headers.entries()) {
      headers[key] = value;
    }

    return headers;
  }

  static getQuery(searchParams: URLSearchParams) {
    const query: Record<string, string> = {};

    for (const [key, value] of searchParams.entries()) {
      query[key] = value;
    }

    return query;
  }

  static async getBody(request: Request) {
    if (request.method !== "GET") {
      return await request.json().catch((_err) => {});
    }

    return undefined;
  }
}
