const vm = require('vm');
const { ObjectId } = require('mongodb');

const ALLOWED_METHODS = new Set([
  'find', 'findOne', 'aggregate', 'countDocuments', 'distinct',
  'updateOne', 'updateMany', 'deleteOne', 'deleteMany',
  'insertOne', 'insertMany', 'createIndex', 'explain',
  'sort', 'limit', 'skip'
]);

function parseChain(str) {
  const methods = [];
  let i = 0;
  while (i < str.length) {
    if (str[i] === '.') {
      i++;
      let name = '';
      while (i < str.length && str[i] !== '(') {
        name += str[i++];
      }
      if (str[i] === '(') {
        i++;
        let depth = 1;
        let args = '';
        while (i < str.length && depth > 0) {
          // Skip over string literals to avoid counting brackets inside strings
          if (str[i] === '"' || str[i] === "'") {
            const quote = str[i];
            args += str[i++];
            while (i < str.length && str[i] !== quote) {
              if (str[i] === '\\') { args += str[i++]; } // skip escaped chars
              if (i < str.length) { args += str[i++]; }
            }
            if (i < str.length) { args += str[i++]; } // closing quote
            continue;
          }
          if (str[i] === '(' || str[i] === '[') depth++;
          if (str[i] === ')' || str[i] === ']') depth--;
          if (depth > 0) args += str[i];
          i++;
        }
        methods.push({ name, args: args.trim() });
      }
    } else {
      i++;
    }
  }
  return methods;
}

function parseArgs(argsStr) {
  if (!argsStr) return [];
  const sandbox = {
    ObjectId: (id) => new ObjectId(id),
    ISODate: (s) => new Date(s),
  };
  const context = vm.createContext(sandbox);
  try {
    return vm.runInContext(`[${argsStr}]`, context, { timeout: 1000 });
  } catch (err) {
    throw new Error(`Erreur de syntaxe dans les arguments: ${err.message}`);
  }
}

function parseQuery(queryStr) {
  const trimmed = queryStr.trim();
  if (!trimmed.startsWith('db.')) {
    throw new Error('La requete doit commencer par "db."');
  }

  const withoutDb = trimmed.slice(3);
  const firstDot = withoutDb.indexOf('.');
  if (firstDot === -1) {
    throw new Error('Format attendu: db.collection.methode(...)');
  }

  const collection = withoutDb.substring(0, firstDot);
  const rest = withoutDb.substring(firstDot);
  const methods = parseChain(rest);

  if (methods.length === 0) {
    throw new Error('Aucune methode detectee');
  }

  for (const m of methods) {
    if (!ALLOWED_METHODS.has(m.name)) {
      throw new Error(`Methode non autorisee: "${m.name}". Methodes autorisees: ${[...ALLOWED_METHODS].join(', ')}`);
    }
  }

  return { collection, methods };
}

async function executeQuery(db, collection, methods) {
  const col = db.collection(collection);
  const first = methods[0];
  const args = parseArgs(first.args);

  if (first.name === 'aggregate') {
    const pipeline = args[0] || [];
    const cursor = col.aggregate(pipeline);
    if (methods.length > 1 && methods[methods.length - 1].name === 'explain') {
      const explainArgs = parseArgs(methods[methods.length - 1].args);
      return cursor.explain(explainArgs[0] || true);
    }
    return cursor.toArray();
  }

  if (first.name === 'find') {
    const filter = args[0] || {};
    const projection = args[1] || undefined;
    let cursor = col.find(filter, projection ? { projection } : {});

    for (let i = 1; i < methods.length; i++) {
      const m = methods[i];
      const mArgs = parseArgs(m.args);
      if (m.name === 'sort') cursor = cursor.sort(mArgs[0]);
      else if (m.name === 'limit') cursor = cursor.limit(mArgs[0]);
      else if (m.name === 'skip') cursor = cursor.skip(mArgs[0]);
      else if (m.name === 'explain') return cursor.explain(mArgs[0] || true);
    }
    return cursor.toArray();
  }

  if (first.name === 'findOne') {
    const filter = args[0] || {};
    const projection = args[1] || undefined;
    return col.findOne(filter, projection ? { projection } : {});
  }

  if (first.name === 'countDocuments') {
    return col.countDocuments(args[0] || {});
  }

  if (first.name === 'distinct') {
    return col.distinct(args[0], args[1] || {});
  }

  if (first.name === 'updateOne' || first.name === 'updateMany') {
    return col[first.name](args[0], args[1], args[2] || {});
  }

  if (first.name === 'deleteOne' || first.name === 'deleteMany') {
    return col[first.name](args[0]);
  }

  if (first.name === 'insertOne') {
    return col.insertOne(args[0]);
  }

  if (first.name === 'insertMany') {
    return col.insertMany(args[0]);
  }

  if (first.name === 'createIndex') {
    return col.createIndex(args[0], args[1] || {});
  }

  throw new Error(`Methode non implementee: ${first.name}`);
}

async function runQuery(db, queryStr, timeoutMs = 3000) {
  const { collection, methods } = parseQuery(queryStr);

  const result = await Promise.race([
    executeQuery(db, collection, methods),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: la requete a depasse 3 secondes')), timeoutMs)
    )
  ]);

  return result;
}

module.exports = { runQuery, parseQuery, parseArgs };
