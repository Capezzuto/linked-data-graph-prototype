export const formatData = (result, entry) => {
  // default property seems to reproduce structure of larger object, so omit for now
  if (entry[0] === 'default') return result;

  if (typeof entry[1] === 'string') {
    result.nodeData[entry[0]] = entry[1];
    return result;
  }

  if (typeof entry[1] === 'object') {
    const isArray = Array.isArray(entry[1]);
    if (isArray) {
      result.children.push({
        nodeDepth: result.nodeDepth + 1,
        nodeData: { _label: entry[0] },
        children: entry[1].map((n) => {
          if (typeof n === 'object') {
            return Object.entries(n).reduce(formatData, {
              nodeDepth: result.nodeDepth + 2,
              nodeData: {},
              children: [],
            });
          }
          return n;
        }),
      });
      // check for null
    } else if (entry[1]) {
      let formatted = Object.entries(entry[1]).reduce(formatData, {
        nodeDepth: result.nodeDepth + 1,
        nodeData: {},
        children: [],
      });
      result.children.push(formatted);
    }
  }
  return result;
};
