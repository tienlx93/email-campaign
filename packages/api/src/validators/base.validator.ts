import { ZodType, ZodTypeDef } from 'zod';
import { RequestHandler } from 'express';

type ValidationSource = 'body' | 'params' | 'query';

/**
 * Base validator — extend this class to create a typed request validator.
 * Override `source` to validate from params or query instead of body.
 * Validated data is written back to `req.body` (or `req.params` for 'params' source).
 */
export abstract class BaseValidator<T> {
  protected abstract schema: ZodType<T, ZodTypeDef, unknown>;
  protected source: ValidationSource = 'body';

  validate: RequestHandler = (req, res, next) => {
    const raw =
      this.source === 'params' ? req.params :
      this.source === 'query' ? req.query :
      req.body;

    const result = this.schema.safeParse(raw);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: result.error.errors });
      return;
    }

    if (this.source === 'params') {
      req.params = result.data as Record<string, string>;
    } else {
      // both 'body' and 'query' results are written to req.body so controllers
      // always read from a single place regardless of HTTP method
      req.body = result.data;
    }
    next();
  };
}
