import React, { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const AmLineChartZoomScroll = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = am5.Root.new(chartRef.current!);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
      })
    );

    // Scrollbar
    chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }));

    // X-Axis (Category)
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "date",
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 30 }),
      })
    );

    // Y-Axis (Value)
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // Line Series
    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Line Series",
        xAxis,
        yAxis,
        valueYField: "value",
        categoryXField: "date",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY}",
        }),
      })
    );

    // Add Data
    const data = Array.from({ length: 50 }).map((_, i) => ({
      date: `Day ${i + 1}`,
      value: Math.round(Math.random() * 100),
    }));

    xAxis.data.setAll(data);
    series.data.setAll(data);

    // Zoom to latest
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, []);

  return <div id="amchart" ref={chartRef} style={{ width: "100%", height: "500px" }} />;
};

export default AmLineChartZoomScroll;
