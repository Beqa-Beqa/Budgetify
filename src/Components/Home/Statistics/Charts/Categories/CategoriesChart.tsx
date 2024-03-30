import { useContext, useEffect, useRef } from "react";
import "./categoriesChart.css";
import * as d3 from "d3";
import { getCategoryNameById, removeThousandsCommas } from "../../../../../Functions";
import { AuthContext } from "../../../../../Contexts/AuthContextProvider";
import randomColor from "randomcolor";

const CategoriesChart = (props: {
  statisticsData: TransactionData[]
}) => {
  const {statisticsData} = props;

  const {categoriesData} = useContext(AuthContext);

  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if(divRef.current) {
      const w = 450;
      const h = 400;
      const padding = 30;
  
      const datasetForScale: number[] = statisticsData.reduce((arr: number[], transaction) => {
        const amount = removeThousandsCommas(transaction.amount);
        if(amount) {
          arr.push(amount);
        }
        return arr;
      }, []);

      const datasetForBars: [string, number, string][] = statisticsData.reduce((arr: [string, number, string][], transaction) => {
        for(let category of transaction.chosenCategories) {
          const categ = getCategoryNameById(categoriesData, category) || category;
          if(arr.flat().indexOf(categ) === -1) {
            const color = randomColor();
            arr.push([categ, removeThousandsCommas(transaction.amount), color]);
          }
        }
        return arr;
      }, []);

      if(datasetForScale.length && statisticsData.length) {
        const svg = d3.select(divRef.current)
                      .append("svg")
                      .attr("width", w)
                      .attr("height", h);
  
        const xScale = d3.scaleLinear()
                         .domain([])
                         .range([padding * 2, w - padding]);

        const yScale = d3.scaleLinear()
                         .domain([0, d3.max(datasetForScale)!])
                         .range([h - padding, padding]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
           .attr("transform", `translate(0, ${h - padding})`)
           .call(xAxis);
    
        svg.append("g")
           .attr("transform", `translate(${padding * 2}, 0)`)
           .call(yAxis);

        svg.append("text")
           .text("$")
           .attr("text-anchor", "end")
           .attr("y", padding / 1.5)
           .attr("x", padding * 1.5);

        svg.append("text")
           .text("Category")
           .attr("x", w - padding * 3.5)
           .attr("y", h - padding / 2.5);

        const dynamic = (w - padding * 3) / datasetForBars.length - 5;
        const rectWidth = dynamic < 40 ? dynamic : 40;

        svg.selectAll("rect")
           .data(datasetForBars)
           .enter()
           .append("rect")
           .attr("x", (_, i) => padding * 2 + 5 + (5 + rectWidth) * i)
           .attr("y", (d) => yScale(d[1]))
           .attr("width", rectWidth)
           .attr("height", (d) => h - padding - yScale(d[1]))
           .attr("fill", (d) => d[2]);

        svg.selectAll(".category-text")
           .data(datasetForBars)
           .enter()
           .append("text")
           .text((d) => d[0])
           .attr("x", (_, i) => padding + 5 + (5 + rectWidth) * i)
           .attr("y", (d) => yScale(d[1]) + padding / 2)
           .attr("transform", (d, i) => `rotate(-90 ${padding * 2 + 5 + (5 + rectWidth) * i}, ${yScale(d[1])})`)
           .style("fill", "black")
           .style("font-size", 12 + "px");

        // cleanup
        return () => {
          svg.remove()
        };
      }
    }
  }, [statisticsData, divRef.current]);

  if(statisticsData.length) {
    return <div id="category-chart" className="rounded-4" ref={divRef} />
  } 
}

export default CategoriesChart;