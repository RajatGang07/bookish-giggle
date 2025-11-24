const useTraverseTree = () => {
    const insertNode = function (tree, folderId, item, isFolder) {
      if (tree.id === folderId && tree.isFolder) {
        tree.items.unshift({
          id: new Date().getTime(),
          name: item,
          isFolder: isFolder,
          items: []
        });
  
        return tree;
      }
  
      let latestNode = tree.items.map(ob =>
        insertNode(ob, folderId, item, isFolder)
      );
  
      return { ...tree, items: latestNode };
    };
  
    const deleteNode = function (tree, nodeId) {
      if (!tree.items) return tree;
  
      // Filter out the node that matches
      const filteredItems = tree.items
        .filter(item => item.id !== nodeId)
        .map(item => deleteNode(item, nodeId));
  
      return { ...tree, items: filteredItems };
    };

    const renameNode = function (tree, nodeId, newName) {
      if (tree.id === nodeId) {
        return { ...tree, name: newName };
      }
  
      const updatedItems = tree.items.map(item =>
        renameNode(item, nodeId, newName)
      );
  
      return { ...tree, items: updatedItems };
    };
  
    return { insertNode, deleteNode, renameNode };
  };
  
  export default useTraverseTree;
  