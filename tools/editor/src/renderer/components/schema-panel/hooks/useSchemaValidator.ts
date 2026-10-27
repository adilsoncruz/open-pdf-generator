import { useState, useEffect } from 'react'
import Ajv, { type ErrorObject } from 'ajv'
import { validateJson } from '../utils/validateJson'

const ajv = new Ajv({ allErrors: true, strict: false })

export function useSchemaValidator(jsonInput: string, testData: Record<string, unknown> | undefined) {
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isJsonValid, setIsJsonValid] = useState(true)
  const [errorLine, setErrorLine] = useState<number | null>(null)
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [dataErrors, setDataErrors] = useState<ErrorObject[]>([])

  useEffect(() => {
    const jsonRes = validateJson(jsonInput)
    setIsJsonValid(jsonRes.valid)
    setErrorLine(jsonRes.errorLine)
    setJsonError(jsonRes.error)

    if (!jsonRes.valid || !jsonInput.trim()) {
      setSchemaError(null)
      setDataErrors([])
      return
    }

    try {
      const parsedSchema = JSON.parse(jsonInput)
      const validate = ajv.compile(parsedSchema)
      setSchemaError(null)

      const valid = validate(testData || {})
      if (!valid && validate.errors) {
        setDataErrors(validate.errors)
      } else {
        setDataErrors([])
      }
    } catch (e) {
      setSchemaError((e as Error).message)
      setDataErrors([])
    }
  }, [jsonInput, testData])

  return {
    jsonError,
    isJsonValid,
    errorLine,
    schemaError,
    setSchemaError,
    dataErrors,
    setDataErrors,
    ajv,
  }
}
