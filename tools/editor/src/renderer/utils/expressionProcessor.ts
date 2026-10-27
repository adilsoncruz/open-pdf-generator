/**
 * Expression processor for Data Binding in the frontend.
 * 
 * Modularized into:
 * - expressions/builtinFunctions.ts
 * - expressions/evaluator.ts
 * - expressions/expressionProcessor.ts
 */

export * from './expressions'
export {
  hasTransformations,
  extractBinding,
  resolveBinding,
  applyTransformation,
  processExpression
} from './expressions/expressionProcessor'
