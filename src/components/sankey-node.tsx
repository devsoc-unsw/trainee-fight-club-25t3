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
        fill="var(--primary)"
        stroke="var(--primary)"
        strokeWidth={1}
        rx={3}
      />

      {/* Node Name */}
      <text
        textAnchor={isOut ? "end" : "start"}
        x={isOut ? x - 8 : x + width + 8}
        y={y + height / 2}
        dominantBaseline="middle"
        fontSize={13}
        fill="var(--foreground)"
        fontWeight={500}
      >
        {payload.name}
      </text>

      {/* Node Value */}
      <text
        textAnchor={isOut ? "end" : "start"}
        x={isOut ? x - 8 : x + width + 8}
        y={y + height / 2 + 16}
        fontSize={12}
        fill="var(--muted-foreground)"
      >
        ${payload.value}
      </text>
    </Layer>
  );
}
