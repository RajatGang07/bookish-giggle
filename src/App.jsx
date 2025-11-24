import { useState } from "react";
import Folder from "./components/Folder";
import useTraverseTree from "./hooks/use-traverse-tree";
import "./App.css";
import explorer from "./constant/data"

export default function App() {
  const [explorerData, setExplorerData] = useState(explorer);

  const { insertNode, renameNode, deleteNode } = useTraverseTree();

  const handleInsertNode = (folderId, item, isFolder) => {
    const finalTree = insertNode(explorerData, folderId, item, isFolder);
    setExplorerData(finalTree);
  };

  const handleDeleteNode = (folderId) => {
    const finalTree = deleteNode(explorerData, folderId);
    setExplorerData(finalTree);
  };

  const handleRenameNode = (folderId, name) => {
    const finalTree = renameNode(explorerData, folderId, name);
    setExplorerData(finalTree);
  };

  return (
    <div className="App">
      <Folder handleInsertNode={handleInsertNode} explorer={explorerData} handleDeleteNode={handleDeleteNode} handleRenameNode={handleRenameNode} />
    </div>
  );
}
