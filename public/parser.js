Object.constructor.prototype.error = function(message, t) {
  t = t || this;
  t.name = "SyntaxError";
  t.message = message;
  throw treturn;
};

RegExp.prototype.bexec = function(str) {
  var i, m;
  i = this.lastIndex;
  m = this.exec(str);
  if (m && m.index === i) {
    return m;
  }
  return null;
};

String.prototype.tokens = function() {
  var RESERVED_WORD, from, getTok, i, key, m, make, n, result, rw, tokens, value;
  from = void 0;
  i = 0;
  n = void 0;
  m = void 0;
  result = [];
  tokens = {
    WHITES: /\s+/g,
    ID: /[a-zA-Z_]\w*/g,
    NUM: /\b\d+(\.\d*)?([eE][+-]?\d+)?\b/g,
    STRING: /('(\\.|[^'])*'|"(\\.|[^"])*")/g,
    ONELINECOMMENT: /\/\/.*/g,
    MULTIPLELINECOMMENT: /\/[*](.|\n)*?[*]\//g,
    COMPARISONOPERATOR: /[<>=!]=|[<>]/g,
    ONECHAROPERATORS: /([=()&|;:,{}[\]])/g,
    ADDOP: /[+-]/g,
    MULTOP: /[*\/]/g
  };
  RESERVED_WORD = {
    p: "P",
    "if": "IF",
    then: "THEN"
  };
  make = function(type, value) {
    return {
      type: type,
      value: value,
      from: from,
      to: i
    };
  };
  getTok = function() {
    var str;
    str = m[0];
    i += str.length;
    return str;
  };
  if (!this) {
    return;
  }
  while (i < this.length) {
    for (key in tokens) {
      value = tokens[key];
      value.lastIndex = i;
    }
    from = i;
    if (m = tokens.WHITES.bexec(this) || (m = tokens.ONELINECOMMENT.bexec(this)) || (m = tokens.MULTIPLELINECOMMENT.bexec(this))) {
      getTok();
    } else if (m = tokens.ID.bexec(this)) {
      rw = RESERVED_WORD[m[0]];
      if (rw) {
        result.push(make(rw, getTok()));
      } else {
        result.push(make("ID", getTok()));
      }
    } else if (m = tokens.NUM.bexec(this)) {
      n = +getTok();
      if (isFinite(n)) {
        result.push(make("NUM", n));
      } else {
        make("NUM", m[0]).error("Bad number");
      }
    } else if (m = tokens.STRING.bexec(this)) {
      result.push(make("STRING", getTok().replace(/^["']|["']$/g, "")));
    } else if (m = tokens.COMPARISONOPERATOR.bexec(this)) {
      result.push(make("COMPARISON", getTok()));
    } else if (m = tokens.ADDOP.bexec(this)) {
      result.push(make("ADDOP", getTok()));
    } else if (m = tokens.MULTOP.bexec(this)) {
      result.push(make("MULTOP", getTok()));
    } else if (m = tokens.ONECHAROPERATORS.bexec(this)) {
      result.push(make(m[0], getTok()));
    } else {
      throw "Syntax error near '" + (this.substr(i)) + "'";
    }
  }
  return result;
};

var parse = function(input) {
  var condition, expression, factor, lookahead, match, statement, statements, term, tokens, tree;
  tokens = input.tokens();
  lookahead = tokens.shift();
  match = function(t) {
    if (lookahead.type === t) {
      lookahead = tokens.shift();
      if (typeof lookahead === "undefined") {
        lookahead = null;
      }
    } else {
      throw ("Syntax Error. Expected " + t + " found '") + lookahead.value + "' near '" + input.substr(lookahead.from) + "'";
    }
  };

programm = function(){
  var result;
  result = block;
  match(".");
  return result;
}

block = function() {
  var result, left, right;
  if (lookahead && lookahead.value === "const") {
    match("const");
    left = {
      type: "ID",
      value: lookahead.value
    };
    match("ID");
    match("=");
    right = lookahead.value;
    match("NUM");

    result = {
      type: "=",
      left: left,
      right: right

    };
    while (lookahead && lookahead.value === "const") {
      match("const");
      result = {
        type: "ID",
        value: lookahead.value
      };
      match("ID");
      match("=");
      right = lookahead.value;
      match("NUM");

      result = {
        type: "=",
        left: left,
        right: right

      };
    }
    match(";");
  };

  else if (lookahead && lookahead.value === "var") {
    match("var");
    result = {
      type: "ID",
      value: lookahead.value
    };
    match("ID");
    while (lookahead && lookahead.value === ",") {
      match(",");
      result = {
        type: "ID",
        value: lookahead.value
      };
      match("ID");
    }
    match(";");
  };
  else if (lookahead && lookahead.value === "procedure")
    while (lookahead && lookahead.value === "procedure") {
      match("procedure");
      result = {
        type: "ID",
        value: lookahead.value
      };
      match("ID");
      match("(");
      while (lookahead && lookahead.value === "var"){
        match("var");
        result = {
        type: "ID",
        value: lookahead.value
      };
      }
      match(")");
      left = block();
    }
    right = statement();
    result = {
        type: "block",
        left: left,
        right: right

      };
      return result;
}

statement = function(){
  var result, right, left;

  if (lookahead && lookahead.type === "ID") {
    left = {
      type: "ID",
      value: lookahead.value
    };
    match("ID");
    match("=");
    right = expression();
    result = {
        type: "=",
        left: left,
        right: right
      };
  };
  else if(lookahead && lookahead.value === "call") {
    match("call");
    result = {
      type: "ID",
      value: lookahead.value
    };
    match("ID")
  };
  else if(lookahead && lookahead.value === "begin") {
    match("begin");
    result = statement();
    while (lookahead && lookahead.value === ";") {
      match(";");
      result = statement();
    }
    match("end");
  };
  else if(lookahead && lookahead.value === "if") {
    match("if");
    left = condition();
    match("then");
    right = statement();
    result = {
      type: "statement",
      left: left,
      right: right
    };
    if(lookahead && lookahead.value === "else"){
      match("else");
      result = statement();
    };
  };
  else if(lookahead && lookahead.value === "while") {
    match("while");
    left = condition();
    match("do");
    right = statement();
    result = {
      type: "statement",
      left: left,
      right: right
    };
  };
  return rasult;
}

condition(){
  var result, right, left, type;
  left = expression();
  type = lookahead.value;
      match("COMPARISON");
  right = expression();
  result = {
      type: type,
      left: left,
      right: right
    };
  return result;
}

  expression = function() {
    var result, right, type;
    result = term();

    while (lookahead && lookahead.type === "ADDOP") {
      type = lookahead.value;
      match("ADDOP");
      right = term();
      result = {
        type: type,
        left: result,
        right: right
      };
    }
    return result;
  };

  term = function() {
    var result, right, type;
    result = factor();
    if (lookahead && lookahead.type === "MULTOP") {
  type = lookahead.value;
      match("MULTOP");
      right = term();
      result = {
        type: type,
        left: result,
        right: right
      };
    }
    return result;
};
  factor = function() {
    var result;
    result = null;
  if (lookahead.type === "ID") {
          result = {
              type: "ID",
              value: lookahead.value
          }
          match("ID");
  };
    else if (lookahead.type === "NUM") {
      result = {
        type: "NUM",
        value: lookahead.value
      };
      match("NUM");
    } else if (lookahead.type === "(") {
        match("(");
        result = expression();
        match(")");
    } else {
      throw "Syntax Error. Expected number or identifier or '(' but found " + (lookahead ? lookahead.value : "end of input") + " near '" + input.substr(lookahead.from) + "'";
    }
    return result;
  };

  tree = expression(input);
  if (lookahead != null) {
    throw "Syntax Error parsing statements. " + "Expected 'end of input' and found '" + input.substr(lookahead.from) + "'";
  }
  return tree;
};
