import { Rectangle, Layer } from "recharts";

export default function SankeyNode({
  x,
  y,
  width,
  height,
  index,
  payload,
  containerWidth = 700,
}: any) {
  const isOut = x + width + 80 > containerWidth;

  return (
    <Layer key={`CustomNode${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#2563EB" // blue-600
        stroke="#1E40AF" // blue-800
        strokeWidth={1}
        rx={3}
      />

      <text
        textAnchor={isOut ? "end" : "start"}
        x={isOut ? x - 8 : x + width + 8}
        y={y + height / 2}
        dominantBaseline="middle"
        fontSize={13}
        fill="#E5E7EB" // gray-200
        fontWeight={500}
      >
        {payload.name}
      </text>

      <text
        textAnchor={isOut ? "end" : "start"}
        x={isOut ? x - 8 : x + width + 8}
        y={y + height / 2 + 16}
        fontSize={12}
        fill="#E5E7EB" // gray-400
      >
        ${payload.value}
      </text>
    </Layer>
  );
}
