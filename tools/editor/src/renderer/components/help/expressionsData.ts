export type ExpressionCategory =
  | 'text'
  | 'numbers'
  | 'dates'
  | 'lists'
  | 'template'
  | 'conditions'
  | 'utils'

export interface ExpressionExample {
  expression: string
  input: string
  output: string
  description?: string
}

export interface TabContent {
  title: string
  icon: string
  description: string
  examples: ExpressionExample[]
}

export const EXPRESSIONS_CONTENT: Record<ExpressionCategory, TabContent> = {
  text: {
    title: 'Text',
    icon: '📝',
    description: 'Transformations to manipulate strings and text.',
    examples: [
      { expression: 'name | upperCase', input: '"John Doe"', output: '"JOHN DOE"', description: 'Convert to uppercase' },
      { expression: 'name | lowerCase', input: '"John Doe"', output: '"john doe"', description: 'Convert to lowercase' },
      { expression: 'name | capitalize', input: '"JOHN DOE"', output: '"John Doe"', description: 'Capitalize each word' },
      { expression: 'text | trim', input: '"  Hello  "', output: '"Hello"', description: 'Remove leading/trailing spaces' },
      { expression: 'description | truncate:20', input: '"Very long description..."', output: '"Very long descrip..."', description: 'Truncate to N characters' },
      { expression: 'description | truncate:15:"→"', input: '"Very long text here"', output: '"Very long text→"', description: 'Truncate with custom suffix' },
      { expression: 'code | replace:".":""', input: '"123.456.789"', output: '"123456789"', description: 'Replace text' },
      { expression: 'code | padLeft:10:"0"', input: '"123"', output: '"0000000123"', description: 'Pad left' },
      { expression: 'code | padRight:10:"."', input: '"ABC"', output: '"ABC......."', description: 'Pad right' },
      { expression: 'value | prefix:"$ "', input: '"100.00"', output: '"$ 100.00"', description: 'Add prefix' },
      { expression: 'value | suffix:" USD"', input: '"100"', output: '"100 USD"', description: 'Add suffix' },
      { expression: 'text | reverse', input: '"ABC"', output: '"CBA"', description: 'Reverse string' },
    ],
  },
  numbers: {
    title: 'Numbers',
    icon: '🔢',
    description: 'Formatting and operations with numbers.',
    examples: [
      { expression: "total | format:'#,##0.00'", input: '1234.5', output: '"1,234.50"', description: 'Format number with pattern' },
      { expression: "price | currency:'USD'", input: '1234.56', output: '"$1,234.56"', description: 'Format as USD currency' },
      { expression: "price | currency:'EUR'", input: '1234.56', output: '"€1,234.56"', description: 'Format as EUR currency' },
      { expression: "price | currency:'BRL'", input: '1234.56', output: '"R$ 1.234,56"', description: 'Format as BRL currency' },
      { expression: "value | numberFormat:'en-US'", input: '1234567.89', output: '"1,234,567.89"', description: 'Format by locale' },
      { expression: 'balance | abs', input: '-150.50', output: '150.50', description: 'Absolute value' },
      { expression: 'average | round:2', input: '3.14159', output: '3.14', description: 'Round to N decimals' },
      { expression: 'value | floor', input: '3.9', output: '3', description: 'Round down' },
      { expression: 'value | ceil', input: '3.1', output: '4', description: 'Round up' },
    ],
  },
  dates: {
    title: 'Dates',
    icon: '📅',
    description: 'Date and timestamp formatting.',
    examples: [
      { expression: "date | date:'MM/dd/yyyy'", input: '"2024-11-26"', output: '"11/26/2024"', description: 'US format' },
      { expression: "date | date:'dd/MM/yyyy'", input: '"2024-11-26"', output: '"26/11/2024"', description: 'EU format' },
      { expression: "date | date:'yyyy-MM-dd'", input: '"11/26/2024"', output: '"2024-11-26"', description: 'ISO format' },
      { expression: "date | date:'dd/MM/yy'", input: '"2024-11-26"', output: '"26/11/24"', description: 'Short year' },
      { expression: "timestamp | date:'MM/dd/yyyy HH:mm'", input: '"2024-11-26T14:30:00"', output: '"11/26/2024 14:30"', description: 'Date and time' },
      { expression: "timestamp | date:'HH:mm:ss'", input: '"2024-11-26T14:30:45"', output: '"14:30:45"', description: 'Time only' },
    ],
  },
  lists: {
    title: 'Lists',
    icon: '📋',
    description: 'Operations with arrays and lists.',
    examples: [
      { expression: "tags | join:', '", input: '["A", "B", "C"]', output: '"A, B, C"', description: 'Join with separator' },
      { expression: "items | join:' - '", input: '["Item 1", "Item 2"]', output: '"Item 1 - Item 2"', description: 'Join with dash' },
      { expression: "emails | join:'; '", input: '["a@x.com", "b@y.com"]', output: '"a@x.com; b@y.com"', description: 'Join with semicolon' },
      { expression: 'items | first', input: '["A", "B", "C"]', output: '"A"', description: 'First element' },
      { expression: 'items | last', input: '["A", "B", "C"]', output: '"C"', description: 'Last element' },
      { expression: 'items | length', input: '["A", "B", "C"]', output: '3', description: 'Number of elements' },
    ],
  },
  template: {
    title: 'Template',
    icon: '🧩',
    description: 'Combine multiple properties of an object into a custom format.',
    examples: [
      { expression: "phone | template:'(${code}) ${number}'", input: '{ code: "11", number: "555-1234" }', output: '"(11) 555-1234"', description: 'Format phone number' },
      { expression: "address | template:'${street}, ${number}'", input: '{ street: "Main St", number: "1234" }', output: '"Main St, 1234"', description: 'Format address' },
      { expression: "person | template:'${firstName} ${lastName}'", input: '{ firstName: "John", lastName: "Doe" }', output: '"John Doe"', description: 'Full name' },
      { expression: "person | template:'${firstName | upperCase} ${lastName}'", input: '{ firstName: "John", lastName: "Doe" }', output: '"JOHN Doe"', description: 'With nested expression' },
      { expression: "invoice | template:'Total: ${total | currency:\"USD\"}'", input: '{ total: 1234.56 }', output: '"Total: $1,234.56"', description: 'With currency formatting' },
      { expression: "doc | template:'${type}: ${number | padLeft:10:\"0\"}'", input: '{ type: "INV", number: "123" }', output: '"INV: 0000000123"', description: 'Combining expressions' },
    ],
  },
  conditions: {
    title: 'Print Conditions',
    icon: '🔍',
    description: 'Boolean expressions to control when elements, groups, or sections are printed.',
    examples: [
      { expression: 'invoice.total > 0', input: '{ total: 1500 }', output: 'true', description: 'Greater than' },
      { expression: 'invoice.total >= 1000', input: '{ total: 1000 }', output: 'true', description: 'Greater or equal' },
      { expression: 'invoice.total < 500', input: '{ total: 300 }', output: 'true', description: 'Less than' },
      { expression: 'invoice.total <= 100', input: '{ total: 100 }', output: 'true', description: 'Less or equal' },
      { expression: 'invoice.status == "paid"', input: '{ status: "paid" }', output: 'true', description: 'Equal (text)' },
      { expression: 'invoice.status != "cancelled"', input: '{ status: "pending" }', output: 'true', description: 'Not equal' },
      { expression: 'invoice.total > 0 && invoice.status == "paid"', input: '{ total: 100, status: "paid" }', output: 'true', description: 'Logical AND' },
      { expression: 'invoice.urgent || invoice.priority == "high"', input: '{ urgent: false, priority: "high" }', output: 'true', description: 'Logical OR' },
      { expression: '!invoice.cancelled', input: '{ cancelled: false }', output: 'true', description: 'Negation (NOT)' },
      { expression: 'invoice.items.length > 0', input: '{ items: [{}, {}] }', output: 'true', description: 'Non-empty array' },
      { expression: 'invoice.items.length >= 5', input: '{ items: [1,2,3,4,5] }', output: 'true', description: 'Array with minimum items' },
      { expression: 'invoice.taxes.length > 1', input: '{ taxes: [{}, {}] }', output: 'true', description: 'Multiple taxes' },
      { expression: 'invoice.discount != null', input: '{ discount: 10 }', output: 'true', description: 'Field exists and not null' },
      { expression: 'invoice.notes != ""', input: '{ notes: "Note..." }', output: 'true', description: 'Field is not empty' },
      { expression: 'invoice.paid', input: '{ paid: true }', output: 'true', description: 'Boolean field true' },
      { expression: 'invoice.hasDiscount', input: '{ hasDiscount: true }', output: 'true', description: 'Flag active' },
      { expression: '!invoice.draft', input: '{ draft: false }', output: 'true', description: 'Flag inactive (negated)' },
      { expression: '(invoice.type == "A" || invoice.type == "B") && invoice.total > 0', input: '{ type: "A", total: 100 }', output: 'true', description: 'Condition with parentheses' },
      { expression: 'invoice.items.length > 0 && invoice.status != "cancelled"', input: '{ items: [{}], status: "active" }', output: 'true', description: 'Multiple conditions' },
    ],
  },
  utils: {
    title: 'Utilities',
    icon: '🛠️',
    description: 'Helper functions and default values.',
    examples: [
      { expression: "name | default:'Not provided'", input: '""', output: '"Not provided"', description: 'Default if empty' },
      { expression: "name | default:'N/A'", input: 'null', output: '"N/A"', description: 'Default if null' },
      { expression: 'text | length', input: '"Hello world"', output: '11', description: 'String length' },
    ],
  },
}
