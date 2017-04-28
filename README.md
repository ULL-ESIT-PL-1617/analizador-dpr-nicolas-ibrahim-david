# Práctica

## Gramática

 program = block "."

 block =
     ["const" ID "=" number ("," ID "=" number)* ";"]
     ["var" ID ("," ID)* ";"]
     ("procedure" ID "(" ("var" ID)* ")"  block ";")* statement

 statement =
     ID "=" expression
     | "call" ID
     | "begin" statement (";" statement )* "end"
     | "if" condition "then" statement ("else" statement)?
     | "while" condition "do" statement
	 | "return" expression

 condition =
      expression ("=="|"!="|"<"|"<="|">"|">=") expression

 expression = term (("+"|"-") term)*

 term = factor (("*"|"/") factor)*

 factor =
     ID
     | number
     | "(" expression ")" 
