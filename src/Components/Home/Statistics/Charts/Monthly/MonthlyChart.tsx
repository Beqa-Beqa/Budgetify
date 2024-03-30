import { useEffect, useRef } from "react";
import "./monthlyChart.css";
import * as d3 from "d3";
import { removeThousandsCommas } from "../../../../../Functions";

const MonthlyChart = (props: {
  statisticsData: {
    [key: string]: TransactionData[];
  }
}) => {
  const {statisticsData} = props;
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if(divRef.current) {
      const w = 600;
      const h = 400;
      const padding = 30;

      const datasetForScale = Object.keys(statisticsData).reduce((obj: {[key: string]: {[key: string]: number[]}}, objKey) =>  {
        const transactionsByMonth = statisticsData[objKey];

        for(let transaction of transactionsByMonth) {
          const existingIncomeData = obj[objKey] && obj[objKey]["Income"] ? obj[objKey]["Income"] : [];
          const existingExpensesData = obj[objKey] && obj[objKey]["Expenses"] ? obj[objKey]["Expenses"] : [];

          if(transaction.transactionType === "Income") {
            obj[objKey] = {
              Income: [...existingIncomeData, removeThousandsCommas(transaction.amount)],
              Expenses: existingExpensesData
            }; 
          } 

          if(transaction.transactionType === "Expenses") {
            obj[objKey] = {
              Income: existingIncomeData,
              Expenses: [...existingExpensesData, removeThousandsCommas(transaction.amount)]
            };
          }
        }
        return obj;
      }, {});

      if(Object.keys(statisticsData).length) {
        const svg = d3.select(divRef.current)
                      .append("svg")
                      .attr("width", w)
                      .attr("height", h);


        const sortedMonths = Object.keys(statisticsData).sort((a, b) => {
          const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          return monthOrder.indexOf(a) - monthOrder.indexOf(b);
        });

        const xScale = d3.scaleBand()
                         .domain(sortedMonths)
                         .range([padding, w - padding * 2]);

        let yScaleMin = 0;
        let yScaleMax = 0;

        for(let key of Object.keys(datasetForScale)) {
          const month = datasetForScale[key];
          const incomes = month.Income;
          const expenses = month.Expenses;
          const incomeMax = incomes && d3.max(incomes);
          const expenseMax = expenses && d3.max(expenses);
          console.log("IncomeMax: ", incomeMax);
          console.log("ExpenseMax: ", expenseMax);
          if(incomeMax && incomeMax > yScaleMax) yScaleMax = incomeMax;
          if(expenseMax && -expenseMax < yScaleMin) yScaleMin = - expenseMax;
        }

        const yScale = d3.scaleLinear()
                         .domain([yScaleMin, yScaleMax])
                         .range([h - padding, padding]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
           .attr("transform", `translate(${padding}, ${h - padding})`)
           .call(xAxis);

        svg.append("g")
           .attr("transform", `translate(${padding * 2}, 0)`)
           .call(yAxis);

        const incomesByMonths = Object.keys(datasetForScale).reduce((arr: [string, number][], key: string) => {
          let amount = 0;
          for(let addition of datasetForScale[key].Income) {
            amount += addition;
          }
          arr.push([key, amount]);
          return arr;
        }, []);

        const expensesByMonths = Object.keys(datasetForScale).reduce((arr: [string, number][], key: string) => {
          let amount = 0;
          for(let addition of datasetForScale[key].Expenses) {
            amount += addition;
          }
          arr.push([key, -amount]);
          return arr;
        }, []);

        const economyByMonths = Object.keys(datasetForScale).reduce((arr: [string, number][], key: string) => {
          let expenseAmount = 0;
          let incomeAmount = 0;
          for(let expense of datasetForScale[key].Expenses) {
            expenseAmount += expense;
          }
          for(let income of datasetForScale[key].Income) {
            incomeAmount += income;
          }
          arr.push([key, incomeAmount - expenseAmount]);
          return arr;
        }, [])

        const linesGenerator: any = d3.line()
                                      .x(d => padding + xScale(d[0].toString())! + xScale.bandwidth() / 2)
                                      .y(d => yScale(d[1]));

        svg.selectAll(".income-circle")
           .data(incomesByMonths)
           .enter()
           .append("circle")
           .attr("r", 5)
           .attr("cx", d => padding + xScale(d[0])! + xScale.bandwidth() / 2)
           .attr("cy", d => yScale(d[1]))
           .attr("fill", "var(--success)");

        svg.append("path")
           .datum(incomesByMonths)
           .attr("fill", "none")
           .attr("stroke", "var(--success)")
           .attr("stroke-width", 3)
           .attr("d", linesGenerator);

        svg.selectAll(".expenses-circle")
           .data(expensesByMonths)
           .enter()
           .append("circle")
           .attr("r", 5)
           .attr("cx", d => padding + xScale(d[0])! + xScale.bandwidth() / 2)
           .attr("cy", d => yScale(d[1]))
           .attr("fill", "var(--danger)");

        svg.append("path")
           .datum(expensesByMonths)
           .attr("fill", "none")
           .attr("stroke", "var(--danger)")
           .attr("stroke-width", 3)
           .attr("d", linesGenerator);

        svg.selectAll(".economy-circle")
           .data(economyByMonths)
           .enter()
           .append("circle")
           .attr("r", 5)
           .attr("cx", d => padding + xScale(d[0])! + xScale.bandwidth() / 2)
           .attr("cy", d => yScale(d[1]))
           .attr("fill", "#6200EE");

        svg.append("path")
           .datum(economyByMonths)
           .attr("fill", "none")
           .attr("stroke", "#6200EE")
           .attr("stroke-width", 3)
           .attr("d", linesGenerator);

        svg.append("rect")
           .attr("width", 25)
           .attr("height", 4)
           .attr("fill", "var(--success)")
           .attr("x", w - padding * 3)
           .attr("y", padding / 2);

        svg.append("text")
           .text("Income")
           .attr("x", w - padding * 2)
           .attr("y", padding / 2 + 5)
           .attr("font-size", 12);

        svg.append("rect")
           .attr("width", 25)
           .attr("height", 4)
           .attr("fill", "var(--danger)")
           .attr("x", w - padding * 3)
           .attr("y", padding);

        svg.append("text")
           .text("Expenses")
           .attr("x", w - padding * 2)
           .attr("y", padding + 5)
           .attr("font-size", 12);

        svg.append("rect")
           .attr("width", 25)
           .attr("height", 4)
           .attr("fill", "#6200EE")
           .attr("x", w - padding * 3)
           .attr("y", padding * 1.5);

        svg.append("text")
           .text("Economy")
           .attr("x", w - padding * 2)
           .attr("y", padding * 1.5 + 5)
           .attr("font-size", 12);

        return () => {
          svg.remove()
        };
      }
    }
  }, [divRef.current, statisticsData]);

  return <div className="w-100 rounded-4" ref={divRef} id="monthly-chart" />
}

export default MonthlyChart;