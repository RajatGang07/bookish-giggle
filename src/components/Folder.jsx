import { useEffect, useState } from "react";

/**
 * Folder component (folders first)
 *
 * Props:
 * - explorer: the node { id, name, isFolder, items }
 * - parent: parent node (pass when rendering children) or null/undefined for root
 * - handleInsertNode(folderId, name, isFolder)
 * - handleDeleteNode(nodeId)
 * - handleRenameNode(nodeId, newName)
 */
function Folder({
  explorer,
  parent = null,
  handleInsertNode = () => {},
  handleDeleteNode = () => {},
  handleRenameNode = () => {}
}) {
  const [expanded, setExpanded] = useState(false);

  // create input state
  const [showCreateInput, setShowCreateInput] = useState({
    visible: false,
    isFolder: false
  });
  const [createValue, setCreateValue] = useState("");
  const [createError, setCreateError] = useState("");

  // rename state
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(explorer.name);
  const [renameError, setRenameError] = useState("");

  // keep renameValue in sync when explorer.name changes externally
  useEffect(() => {
    setRenameValue(explorer.name);
  }, [explorer.name]);

  // ---------- Sorting: folders first, then files; both alphabetically (case-insensitive)
  const getSortedChildren = () => {
    if (!Array.isArray(explorer.items)) return [];

    // make shallow copy to avoid mutating original
    const list = [...explorer.items];

    list.sort((a, b) => {
      // folders should come before files
      if (a.isFolder === b.isFolder) {
        // same type -> sort alphabetically, case-insensitive
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      return a.isFolder ? -1 : 1; // folder first
    });

    return list;
  };

  const sortedChildren = getSortedChildren();

  // ---------- Duplicate checks
  const isDuplicateInThisFolder = (name) => {
    const normalized = name.trim().toLowerCase();
    if (!sortedChildren.length) return false;
    return sortedChildren.some((it) => it.name.trim().toLowerCase() === normalized);
  };

  const isDuplicateAmongSiblings = (name) => {
    const normalized = name.trim().toLowerCase();
    const siblings = parent?.items ?? [];
    if (!siblings.length) return false;
    return siblings.some(
      (it) => it.id !== explorer.id && it.name.trim().toLowerCase() === normalized
    );
  };

  // ---------- Create handlers
  const onCreateKeyDown = (e) => {
    if (e.key === "Enter") {
      const value = (createValue || "").trim();
      if (!value) {
        setCreateError("Name is required");
        return;
      }

      if (isDuplicateInThisFolder(value)) {
        setCreateError("An item with this name already exists in this folder");
        return;
      }

      setCreateError("");
      handleInsertNode(explorer.id, value, showCreateInput.isFolder);

      setCreateValue("");
      setShowCreateInput({ ...showCreateInput, visible: false });
      setExpanded(true);
    } else if (e.key === "Escape") {
      setCreateValue("");
      setCreateError("");
      setShowCreateInput({ ...showCreateInput, visible: false });
    }
  };

  const startCreate = (e, isFolder) => {
    e.stopPropagation();
    setExpanded(true);
    setShowCreateInput({ visible: true, isFolder });
    setCreateValue("");
    setCreateError("");
  };

  // ---------- Rename handlers
  const startRename = (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    setRenameValue(explorer.name);
    setRenameError("");
    if (explorer.isFolder) setExpanded(true);
  };

  const onRenameKeyDown = (e) => {
    if (e.key === "Enter") {
      const newName = (renameValue || "").trim();
      if (!newName) {
        setRenameError("Name is required");
        return;
      }

      if (isDuplicateAmongSiblings(newName)) {
        setRenameError("Another item with this name already exists");
        return;
      }

      setRenameError("");
      handleRenameNode(explorer.id, newName);
      setIsRenaming(false);
    } else if (e.key === "Escape") {
      setIsRenaming(false);
      setRenameValue(explorer.name);
      setRenameError("");
    }
  };

  const onRenameBlur = () => {
    setIsRenaming(false);
    setRenameValue(explorer.name);
    setRenameError("");
  };

  // ---------- Delete handler
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Delete "${explorer.name}"?`);
    if (!confirmed) return;
    handleDeleteNode(explorer.id);
  };

  // ---------- Render
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

          {/* children: using sortedChildren (folders first) */}
          {sortedChildren.map((child) => (
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

  // File node
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
