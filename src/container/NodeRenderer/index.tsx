import React, { memo, ComponentType, MouseEvent } from 'react';

import { useStoreState } from '../../store/hooks';
import { getNodesInside } from '../../utils/graph';
import { Node, Transform, NodeTypesType, WrapNodeProps, Elements, Edge } from '../../types';

interface NodeRendererProps {
  nodeTypes: NodeTypesType;
  selectNodesOnDrag: boolean;
  onElementClick?: (event: MouseEvent, element: Node | Edge) => void;
  onNodeMouseEnter?: (event: MouseEvent, node: Node) => void;
  onNodeMouseMove?: (event: MouseEvent, node: Node) => void;
  onNodeMouseLeave?: (event: MouseEvent, node: Node) => void;
  onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
  onNodeDragStart?: (event: MouseEvent, node: Node) => void;
  onNodeDragStop?: (event: MouseEvent, node: Node) => void;
  onlyRenderVisibleNodes: boolean;
  snapToGrid: boolean;
  snapGrid: [number, number];
}

function renderNode(
  node: Node,
  props: NodeRendererProps,
  transform: Transform,
  selectedElements: Elements | null,
  nodesDraggable: boolean,
  nodesConnectable: boolean,
  elementsRemovable: boolean,
  elementsSelectable: boolean
) {
  const nodeType = node.type || 'default';
  const NodeComponent = (props.nodeTypes[nodeType] || props.nodeTypes.default) as ComponentType<WrapNodeProps>;
  if (!props.nodeTypes[nodeType]) {
    console.warn(`Node type "${nodeType}" not found. Using fallback type "default".`);
  }

  const isSelected = selectedElements ? selectedElements.some(({ id }) => id === node.id) : false;

  const isDraggable = !!(node.draggable || (nodesDraggable && typeof node.draggable === 'undefined'));
  const isRemovable = !!(node.removable || (elementsRemovable && typeof node.removable === 'undefined'));
  const isSelectable = !!(node.selectable || (elementsSelectable && typeof node.selectable === 'undefined'));
  const isConnectable = !!(node.connectable || (nodesConnectable && typeof node.connectable === 'undefined'));
  const isInitialized = node.__rf.width !== null && node.__rf.height !== null;

  return (
    <NodeComponent
      key={node.id}
      id={node.id}
      type={nodeType}
      data={node.data}
      xPos={node.__rf.position.x}
      yPos={node.__rf.position.y}
      isDragging={node.__rf.isDragging}
      onClick={props.onElementClick}
      onMouseEnter={props.onNodeMouseEnter}
      onMouseMove={props.onNodeMouseMove}
      onMouseLeave={props.onNodeMouseLeave}
      onContextMenu={props.onNodeContextMenu}
      onNodeDragStart={props.onNodeDragStart}
      onNodeDragStop={props.onNodeDragStop}
      transform={transform}
      selected={isSelected}
      style={node.style}
      className={node.className}
      isDraggable={isDraggable}
      isRemovable={isRemovable}
      isSelectable={isSelectable}
      isConnectable={isConnectable}
      sourcePosition={node.sourcePosition}
      targetPosition={node.targetPosition}
      selectNodesOnDrag={props.selectNodesOnDrag}
      isHidden={node.isHidden}
      isInitialized={isInitialized}
      snapGrid={props.snapGrid}
      snapToGrid={props.snapToGrid}
    />
  );
}

const NodeRenderer = (props: NodeRendererProps) => {
  const nodes = useStoreState((s) => s.nodes);
  const transform = useStoreState((s) => s.transform);
  const selectedElements = useStoreState((s) => s.selectedElements);
  const viewportBox = useStoreState((s) => s.viewportBox);
  const nodesDraggable = useStoreState((s) => s.nodesDraggable);
  const nodesConnectable = useStoreState((s) => s.nodesConnectable);
  const elementsRemovable = useStoreState((s) => s.elementsRemovable);
  const elementsSelectable = useStoreState((s) => s.elementsSelectable);

  const transformStyle = {
    transform: `translate(${transform[0]}px,${transform[1]}px) scale(${transform[2]})`,
  };

  const renderNodes = props.onlyRenderVisibleNodes ? getNodesInside(nodes, viewportBox, transform, true) : nodes;

  return (
    <div className="react-flow__nodes" style={transformStyle}>
      {renderNodes.map((node) =>
        renderNode(node, props, transform, selectedElements, nodesDraggable, nodesConnectable, elementsRemovable, elementsSelectable)
      )}
    </div>
  );
};

NodeRenderer.displayName = 'NodeRenderer';

export default memo(NodeRenderer);
