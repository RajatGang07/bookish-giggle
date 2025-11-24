import { useEffect, useState } from "react";

/**
 * Folder component
 *
 * Props:
 * - explorer: the node { id, name, isFolder, items }
 * - parent: parent node (pass when rendering children) or null/undefined for root
 * - handleInsertNode(folderId, name, isFolder)
 * - handleDeleteNode(nodeId)
 * - handleRenameNode(nodeId, newName)
 *
 * Example usage in parent:
 * <Folder
 *   explorer={root}
 *   parent={null}
 *   handleInsertNode={handleInsertNode}
 *   handleDeleteNode={handleDeleteNode}
 *   handleRenameNode={handleRenameNode}
 * />
 */
function Folder({
  explorer,
  parent = null,
  handleInsertNode = () => {},
  handleDeleteNode = () => {},
  handleRenameNode = () => {}
}) {
  const [expanded, setExpanded] = useState(false);

  // show create input (for adding file/folder)
  const [showCreateInput, setShowCreateInput] = useState({
    visible: false,
    isFolder: false
  });
  const [createValue, setCreateValue] = useState("");
  const [createError, setCreateError] = useState("");

  // renaming state
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(explorer.name);
  const [renameError, setRenameError] = useState("");

  // keep renameValue in sync when explorer.name changes externally
  useEffect(() => {
    setRenameValue(explorer.name);
  }, [explorer.name]);

  // Helpers: check duplicates among items in this folder (for create)
  const isDuplicateInThisFolder = (name) => {
    const normalized = name.trim().toLowerCase();
    if (!explorer.items || !explorer.items.length) return false;
    return explorer.items.some((it) => it.name.trim().toLowerCase() === normalized);
  };

  // Helpers: check duplicate among siblings (for rename)
  const isDuplicateAmongSiblings = (name) => {
    const normalized = name.trim().toLowerCase();

    // if parent is provided, check parent's items
    const siblings = parent?.items ?? [];
    if (!siblings.length) return false;

    return siblings.some(
      (it) => it.id !== explorer.id && it.name.trim().toLowerCase() === normalized
    );
  };

  // Create (handle Enter in create input)
  const onCreateKeyDown = (e) => {
    if (e.key === "Enter") {
      const value = (createValue || "").trim();
      if (!value) {
        setCreateError("Name is required");
        return;
      }

      // validate duplicates in this folder
      if (isDuplicateInThisFolder(value)) {
        setCreateError("An item with this name already exists in this folder");
        return;
      }

      // passed validation
      setCreateError("");
      handleInsertNode(explorer.id, value, showCreateInput.isFolder);

      // reset create input
      setCreateValue("");
      setShowCreateInput({ ...showCreateInput, visible: false });
      // keep folder open after creating
      setExpanded(true);
    } else if (e.key === "Escape") {
      setCreateValue("");
      setCreateError("");
      setShowCreateInput({ ...showCreateInput, visible: false });
    }
    // otherwise ignore
  };

  // Start create (Folder or File)
  const startCreate = (e, isFolder) => {
    e.stopPropagation();
    setExpanded(true);
    setShowCreateInput({ visible: true, isFolder });
    setCreateValue("");
    setCreateError("");
  };

  // Rename handling
  const startRename = (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    setRenameValue(explorer.name);
    setRenameError("");
    // keep parent folder open for visibility
    if (explorer.isFolder) setExpanded(true);
  };

  const onRenameKeyDown = (e) => {
    if (e.key === "Enter") {
      const newName = (renameValue || "").trim();
      if (!newName) {
        setRenameError("Name is required");
        return;
      }

      // check duplicate at same level (siblings)
      if (isDuplicateAmongSiblings(newName)) {
        setRenameError("Another item with this name already exists");
        return;
      }

      // If renaming a folder and also want to check children? typically not necessary.
      setRenameError("");
      handleRenameNode(explorer.id, newName);
      setIsRenaming(false);
    } else if (e.key === "Escape") {
      // cancel
      setIsRenaming(false);
      setRenameValue(explorer.name);
      setRenameError("");
    }
  };

  const onRenameBlur = () => {
    // choose to cancel rename on blur (consistent with earlier notes)
    setIsRenaming(false);
    setRenameValue(explorer.name);
    setRenameError("");
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    // optional: put a confirm prompt here if you want
    const confirmed = window.confirm(`Delete "${explorer.name}"?`);
    if (!confirmed) return;
    handleDeleteNode(explorer.id);
  };

  // Render folder node
  if (explorer.isFolder) {
    return (
      <div style={{ marginTop: 6 }}>
        <div
          onClick={() => setExpanded((s) => !s)}
          className="folder"
          role="button"
          tabIndex={0}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
            padding: "4px 6px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>📁</span>
            <div>
              {isRenaming ? (
                <div>
                  <input
                    value={renameValue}
                    onChange={(ev) => setRenameValue(ev.target.value)}
                    onKeyDown={onRenameKeyDown}
                    onBlur={onRenameBlur}
                    autoFocus
                    onClick={(ev) => ev.stopPropagation()}
                    className="renameInput"
                    style={{ padding: 4 }}
                  />
                  {renameError && (
                    <div className="errorText" style={{ color: "red", fontSize: 12 }}>
                      {renameError}
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ fontWeight: 500 }}>{explorer.name}</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={(e) => startCreate(e, true)}
              title="Add folder"
              onMouseDown={(e) => e.stopPropagation()}
            >
              Folder +
            </button>

            <button
              onClick={(e) => startCreate(e, false)}
              title="Add file"
              onMouseDown={(e) => e.stopPropagation()}
            >
              File +
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startRename(e);
              }}
              title="Rename"
            >
              Rename
            </button>

            <button onClick={handleDeleteClick} title="Delete">
              Delete
            </button>
          </div>
        </div>

        <div style={{ display: expanded ? "block" : "none", paddingLeft: 22 }}>
          {showCreateInput.visible && (
            <div
              className="inputContainer"
              style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span style={{ fontSize: 14 }}>
                {showCreateInput.isFolder ? "📁" : "📄"}
              </span>

              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={createValue}
                  onChange={(e) => setCreateValue(e.target.value)}
                  onKeyDown={onCreateKeyDown}
                  onBlur={() => {
                    // cancel create on blur
                    setShowCreateInput({ ...showCreateInput, visible: false });
                    setCreateError("");
                  }}
                  autoFocus
                  className="inputContainer__input"
                  style={{ padding: 6, width: "100%" }}
                />
                {createError && (
                  <div className="errorText" style={{ color: "red", fontSize: 12 }}>
                    {createError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* children */}
          {Array.isArray(explorer.items) &&
            explorer.items.map((child) => (
              <Folder
                key={child.id}
                explorer={child}
                parent={explorer} // pass parent for sibling checks
                handleInsertNode={handleInsertNode}
                handleDeleteNode={handleDeleteNode}
                handleRenameNode={handleRenameNode}
              />
            ))}
        </div>
      </div>
    );
  }

  // Render file node
  return (
    <div
      className="fileRow"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 6,
        paddingLeft: 8
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        <span style={{ fontSize: 14 }}>📄</span>
        {isRenaming ? (
          <div style={{ flex: 1 }}>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={onRenameKeyDown}
              onBlur={onRenameBlur}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              className="renameInput"
              style={{ padding: 6, width: "100%" }}
            />
            {renameError && (
              <div className="errorText" style={{ color: "red", fontSize: 12 }}>
                {renameError}
              </div>
            )}
          </div>
        ) : (
          <span style={{ flex: 1 }}>{explorer.name}</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            startRename(e);
          }}
        >
          Rename
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(e);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default Folder;
