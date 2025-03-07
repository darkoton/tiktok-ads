//< " СКРИПТЫ " >=============================================================================================================>//
async function init() {
  const res = await fetch("/api/data", {
    method: "GET",
  });
  window.traffic = 0;
  const data = await res.json();

  // Key metric

  tippy(".metric__export", {
    content: '<div class="tooltip-popover">Export Records</div>',
    allowHTML: true,
    animation: "scale",
    theme: "small",
  });

  const dataMetric = data.metric;

  const lineChart = document.getElementById("metricChart");
  let chartDataY = [];
  
  let chartDataX = convertDates(
    dataMetric[Object.keys(dataMetric)[0]].data.map((el) => el.x)
  );
  const colors = ["#009995", "#fec24c"];

  function updateChartMetric() {
    if (window.datapickerValue) {     
      metricChart.data.labels = convertDates(window.datapickerValue.split(","));
    } else {
      metricChart.data.labels = chartDataX;
    }

    metricChart.data.datasets = chartDataY.map((e) => {
      e.data = metricChart.data.labels.map((label) => {
        const matchedElement = dataMetric[e.id].data.find((el) => {
          return convertDate(el.x) === label;
        });
        return matchedElement ? matchedElement.y : "";
      });

      return e;
    });

    metricChart.update();
  }

  const widgetsContainer = document.querySelector("#widgets");

  chartDataY[0] = {
    id: Object.keys(dataMetric)[0],
    label: dataMetric[Object.keys(dataMetric)[0]].title,
    data: dataMetric[Object.keys(dataMetric)[0]].data.map((el) => el.y),
    borderColor: colors[0],
    backgroundColor: colors[0], // Цвет закрашивания для легенды
    fill: false,
    tension: 0.2,
    yAxisID: "y1",
    pointRadius: 0
  };

  const legend1 = document.getElementById('legend1')
  const legend2 = document.getElementById('legend2')

  const axis1 = document.getElementById('axis1')
  const axis2 = document.getElementById('axis2')

  legend1.textContent = dataMetric[Object.keys(dataMetric)[0]].title
  legend1.classList.add('visible')
 
  axis1.textContent = dataMetric[Object.keys(dataMetric)[0]].title + (dataMetric[Object.keys(dataMetric)[0]].units ? ` (${dataMetric[Object.keys(dataMetric)[0]].units})` : '')


  let metricChart = new Chart(lineChart, {
    type: "line",
    data: {
      labels: chartDataX,
      datasets: chartDataY,
    },
    options: {
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: false,
        tooltip: {
          enabled: true, // Включение тултипа
          backgroundColor: '#fff', // Цвет фона тултипа
          titleColor: '#000', // Цвет заголовка
          bodyColor: '#000', // Цвет текста в тултипе
          borderColor: 'rgba(0,0,0,0.2)',
          borderWidth: 1,
          caretSize: 0, // Размер стрелки, указывающей на точку
          cornerRadius: 4, // Радиус скругления углов тултипа
          padding: 10, // Отступы внутри тултипа
          displayColors: true, // Отключить отображение цвета для каждого значения
          callbacks: {
            labelColor: function(tooltipItem) {
              // Изменяем цвет блока и добавляем кастомный стиль
              return {
                backgroundColor: tooltipItem.dataset.backgroundColor, // Цвет
                borderRadius: 5, // Скругляем
                borderWidth: 0, // Ширина рамки
                borderColor: 'transparent' // Цвет рамки
              };
            }
          }
        }
      },
      scales: {
        y1: {
          ticks: {
            maxTicksLimit: 5, 
            callback: function(value) {       

              if (value >= 1000 ) {
                return (value / 1000).toFixed(2).replace(/\.00$/, '') + 'к';
              }
              return value;
            },
          },
          title: {
            align: "center",
            display: false,
            text: dataMetric[Object.keys(dataMetric)[0]].title, // Название для левой оси
          },
          position: "left", // Левая ось
          beginAtZero: true,
          grid: {
            display: true,
          },
        },
        y2: {
          autoSkip: false, 
          ticks: {
            maxTicksLimit: 5, 
            callback: function(value) {
              if (value >= 1000) {
                return (value / 1000).toFixed(2).replace(/\.00$/, '') + 'к';
              }
              return value;
            }
          },
          title: {
            align: "center",
            display: false,
            text: "", // Название для левой оси
          },
          position: "right", // Правая ось
          beginAtZero: true,
          grid: {
            display: false,
          },
        },
        x: {
          position: "bottom",
          ticks: {
            autoSkip: false, 
            maxTicksLimit: 1, 
            callback: function(value, index, values) {       
             const dates = window.datapickerValue && convertDates(window.datapickerValue.split(","))           

              if (values.length < 7 || index === 0 || index === values.length - 1 || (index % Math.floor(values.length / 7) === 0 && values.length - index >= Math.floor(values.length / 7))) {            
                if (dates) {
                  return dates[index];
                }else{
                  return chartDataX[index];
                }
              }
              return "";
            }
          },
          grid: {
            display: false,
          },
        },
      },
    },
  });

  legend1.addEventListener('click', function() {
    legend1.classList.toggle('active')
    const index = this.dataset.legend;
    const dataset = metricChart.data.datasets[index];
    dataset.hidden = !dataset.hidden;
    metricChart.update();
  });
  
  legend2.addEventListener('click', function() {
    legend2.classList.toggle('active')
    const index = this.dataset.legend;
    const dataset = metricChart.data.datasets[index];
    dataset.hidden = !dataset.hidden;
    metricChart.update();
  });

  let slick = null;
  function renderWidgets() {
    if (slick) {
      $(".metric__slider").slick("unslick");
      slick = null;
    }

    const checkedWidgets = Array.from(document.querySelectorAll('.metric__widget')).filter(el => el.classList.contains('checked')).map(el => Array.from(document.querySelectorAll('.metric__widget')).indexOf(el))

    widgetsContainer.innerHTML = "";
    Object.keys(dataMetric).forEach((wg, index) => {
      let trafficPercent = 0;

      if (window.traffic) {
        const pastDate = getDateBefore(window.datapickerValue, window.traffic);

        const pastValue = dataMetric[wg].data.reduce((prev, curr) => {
          prev += +(pastDate.includes(curr.x) ? curr.y : 0);
          return prev;
        }, 0);

        const currentValue = dataMetric[wg].data.reduce((prev, curr) => {
          prev += +(window.datapickerValue.includes(curr.x) ? curr.y : 0);
          return prev;
        }, 0);

        trafficPercent = ((currentValue - pastValue) / (pastValue || 1)) * 100;
      }

      widgetsContainer.innerHTML += `
            <label for="${wg}" class="metric__widget ${checkedWidgets.includes(index) && checkedWidgets.length === 1 ? 'checked disabled' : checkedWidgets.includes(index) ? 'checked' : ''}">
          <div class="metric__widget-top">
            <input  ${checkedWidgets.includes(index) && 'checked'} id="${wg}" data-title="${dataMetric[wg].title
        }" type="checkbox" class="metric__widget-checkbox">
            <span class="metric__widget-label">
              ${dataMetric[wg].title}
            </span>

          <button class="metric__widget-icon">
            <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.11875 9.35063V7.5968L7.71608 7.5648C8.49475 7.5328 9.00787 7.10843 9.00787 6.45996 9.00787 5.81149 8.56942 5.45729 7.89742 5.45729 7.24675 5.45729 6.72008 5.77596 6.60275 6.49063L5.16675 6.25729C5.34808 4.93463 6.42542 4.16663 8.01475 4.16663 9.51088 4.16663 10.5654 5.05196 10.5654 6.41729 10.5654 7.51596 9.8403 8.30435 8.70808 8.51863V9.35063H7.11875zM6.87341 10.908C6.87341 10.332 7.31075 9.89463 7.89742 9.89463 8.48408 9.89463 8.91075 10.332 8.91075 10.908 8.91075 11.4733 8.48408 11.9106 7.89742 11.9106 7.31075 11.9106 6.87341 11.4733 6.87341 10.908z" fill-opacity="1"></path><path d="M0.666748 7.99996C0.666748 3.94987 3.94999 0.666626 8.00008 0.666626C12.0502 0.666626 15.3334 3.94987 15.3334 7.99996C15.3334 12.05 12.0502 15.3333 8.00008 15.3333C3.94999 15.3333 0.666748 12.05 0.666748 7.99996ZM8.00008 14C11.3138 14 14.0001 11.3137 14.0001 7.99996C14.0001 4.68625 11.3138 1.99996 8.00008 1.99996C4.68637 1.99996 2.00008 4.68625 2.00008 7.99996C2.00008 11.3137 4.68637 14 8.00008 14Z" fill-opacity="1"></path></svg>
          </button>
            </div>
              <div class="metric__widget-value"> 
              ${dataMetric[wg].units ? dataMetric[wg].units : ""}
              ${(() => {
          const value = String(parseFloat(dataMetric[wg].data.reduce((prev, curr) => {
            prev += +(window.datapickerValue
              ? window.datapickerValue.includes(curr.x)
                ? curr.y
                : 0
              : curr.y);
            return prev;
          }, 0).toFixed(2)))

          let [number, fraction] = value.split('.')

          if (Number(number) >= 1000) {
            number = number.slice(0, -3) + ',' + number.slice(-3)
          }

          return number + (fraction ? `<span class="fraction">.${fraction}</span>` : '')
        })()
        }
            </div >

    ${window.traffic
          ? `
              <div class="metric__widget-traffic">
              <div class="metric__widget-traffic-value ${trafficPercent === 0 ? '' : trafficPercent > 0 ? "grow" : "fall"
          }">
                 
                  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.43903 5.83504C8.20662 5.56943 7.79343 5.56943 7.56102 5.83504L4.17989 9.69919C3.84986 10.0764 4.11772 10.6667 4.61889 10.6667H11.3812C11.8823 10.6667 12.1502 10.0764 11.8202 9.69919L8.43903 5.83504Z" fill-opacity="1"></path></svg>
                 ${trafficPercent === 0 ?
            '<div class="clear">--</div>'
            : ''
          }
                ${trafficPercent !== 0 ? `<span>${Math.floor(trafficPercent * 100) / 100}%</span>` : ''}
              </div>            
              <span class="metric__widget-traffic-date">Vs. previous ${window.traffic
          } days</span>
            </div>
            `
          : ""
        }
        </label >
    `;
    });


    slick = $(".metric__slider").slick({
      infinite: false,
      slidesToShow: 4,
      slidesToScroll: 4,
      prevArrow: ".metric__slider-prev",
      nextArrow: ".metric__slider-next",
    });

    renderTooltips()
    addEventsWidget()
  }
  renderWidgets();

  // render tooltip
  function renderTooltips() {
    document.querySelectorAll(".metric__widget").forEach((label) => {
      const tooltip = label.querySelector(".metric__widget-icon");

      tippy(tooltip, {
        theme: "big",
        content: `
    <div class="tooltip-body">
        <div class="tooltip-title">${dataMetric[label.htmlFor].title}</div>
        <div class="tooltip-text">${dataMetric[label.htmlFor].desc}</div>
        </div>`,
        allowHTML: true,
        animation: "scale",
      });
    });
  }

  function addEventsWidget() {
    document.querySelectorAll(".metric__widget input").forEach((cb) => {
      cb.addEventListener("change", ({ target }) => {
        const widget = cb.closest(".metric__widget");
        const activeCheckboxes = Array.from(
          document.querySelectorAll(".metric__widget input")
        ).filter((cb) => cb.checked);

        if (target.checked) {
          if (chartDataY.length === 2) {


            const cbx = document.querySelector(
              `.metric__widget #${chartDataY[0].id} `
            );
            cbx.checked = false;
            const wdt = cbx.closest(".metric__widget");
            wdt.classList.remove("checked");

            chartDataY.shift();
            chartDataY[0].borderColor = colors[0];
            chartDataY[0].backgroundColor = colors[0];
            chartDataY[0].yAxisID = "y1";
            // metricChart.options.scales.y1.title.text = chartDataY[0].label;
            axis1.textContent = chartDataY[0].label
            legend1.textContent = chartDataY[0].label
          }

          chartDataY.push({
            id: target.id,
            label: dataMetric[target.id].title,
            data: dataMetric[target.id].data.map((el) => el.y),
            borderColor: colors[chartDataY.length],
            backgroundColor: colors[chartDataY.length], // Цвет закрашивания для легенды
            fill: false,
            tension: 0.2,
            yAxisID: "y2",
            pointRadius: 0
            
          });
          // metricChart.options.scales.y2.title.text =
          //   dataMetric[target.id].title;
            axis2.textContent = dataMetric[target.id].title + (dataMetric[target.id].units ? ` (${dataMetric[target.id].units})` : '')
            legend2.textContent = dataMetric[target.id].title
            legend2.classList.add('visible')

          widget.classList.add("checked");
          activeCheckboxes.forEach((ch) => {
            ch.closest(".metric__widget").classList.remove("disabled");
          });
          updateChartMetric();
        } else {
          if (activeCheckboxes.length === 0) {
            target.checked = true;
            return;
          }

          activeCheckboxes[0]
            .closest(".metric__widget")
            .classList.add("disabled");

          chartDataY = chartDataY.filter(
            (d) => d.label !== dataMetric[target.id].title
          );
          chartDataY[0].backgroundColor = colors[0];
          chartDataY[0].borderColor = colors[0];
          chartDataY[0].yAxisID = "y1";
          // metricChart.options.scales.y1.title.text = chartDataY[0].label;
          // metricChart.options.scales.y2.title.text = "";
          axis1.textContent = chartDataY[0].label
          legend1.textContent =chartDataY[0].label
          
          axis2.textContent = ''
          legend2.textContent=''
          legend2.classList.remove('visible')
          updateChartMetric();
          widget.classList.remove("checked");
        }
      });
    });
  }

  setTimeout(() => {
    const firstWidget = document.querySelector(".metric__widget");
    const first = firstWidget.querySelector("input");
    first.checked = true;
    firstWidget.classList.add("checked");
    firstWidget.classList.add("disabled");
  }, 300);

  //Performance breakdown

  const tabsList = document.getElementById("performance-tabs");
  let activeTab = "gmv";
  function tabItems(data) {
    return Object.keys(data)
      .map((key) => {
        const item = data[key];
        return `<div class="card__tab" data-value="${key}">${item.title}</div>`;
      })
      .join("");
  }

  function sumDataPerfor() {
    let newData;
    if (window.datapickerValue) {
      newData = JSON.parse(JSON.stringify(dataPerfor))[activeTab].data.filter(
        (d) => window.datapickerValue.includes(d.date)
      );
    } else {
      newData = JSON.parse(JSON.stringify(dataPerfor))[activeTab].data;
    }

    return newData.reduce((prev, curr) => {
      if (prev.length === 0) {
        prev.push(...curr.data);
      } else {
        curr.data.forEach((d, i) => {
          prev[i].value = +prev[i].value + +d.value;
        });
      }

      return prev;
    }, []);
  }

  const perforList = document.getElementById("performance-list");
  function perforItems() {
    let newData;
    if (window.datapickerValue) {
      newData = JSON.parse(
        JSON.stringify(
          dataPerfor[activeTab].data.filter((d) =>
            window.datapickerValue.includes(d.date)
          )
        )
      );
    } else {
      newData = JSON.parse(JSON.stringify(dataPerfor[activeTab].data));
    }

    if (!newData.length) {
      newData = JSON.parse(JSON.stringify([dataPerfor[activeTab].data[0]]));

      newData[0].date = null;
      newData[0].data = newData[0].data.map((e) => {
        e.value = 0.000001;
        e.empty = true;

        if (e.data) {
          e.data = e.data.map((r) => {
            r.value = 0;
            return r;
          });
        }

        return e;
      });
    }

    newData = newData.reduce((prev, curr) => {
      if (prev.length === 0) {
        prev.push(...curr.data);
      } else {
        curr.data.forEach((d, i) => {
          prev[i].value = +prev[i].value + +d.value;

          if (prev[i].data) {
            d.data.forEach((dc, ic) => {
              prev[i].data[ic].value = +prev[i].data[ic].value + +dc.value;
            });
          }
        });
      }

      return prev;
    }, []);

    return newData
      .map((item) => {
        return `<li class="performance__spoller ${!item.data ? "not-spoller" : ""
          }">
            <span class="performance__spoller-title _active" ${item.data ? "data-spoller" : ""
          }>
              <div class="performance__spoller-left">
                <span class="dot"></span> ${item.title}

                <a href="#" class="performance__spoller-details">Details</a>
              </div>

              <span class="item-value">${!item.empty ? Math.floor(item.value * 100) / 100 : 0
          }${item.units}</span>
            </span>

           ${item.data
            ? `<ul class="performance__sublist">
              ${item.data
              .map(
                (l) => `<li class="performance__subitem">
                <div class="performance__subitem-left">
                  <span class="item-title">
                    ${l.title}
                  </span>
                  <span class="item-desc">(Contribution 0%)</span>
                </div>
                <span class="item-value">${l.units}${Math.floor(l.value * 100) / 100
                  }</span>
              </li>`
              )
              .join("")}
           
            </ul>`
            : ""
          }
          </li>`;
      })
      .join("");
  }

  const dataPerfor = data.performance;
  perforList.innerHTML += perforItems();

  tabsList.innerHTML += tabItems(dataPerfor);

  document.querySelectorAll(".card__tab")[0].classList.add('active')
  document.querySelectorAll(".card__tab").forEach((tab) =>
    tab.addEventListener("click", () => {

      document.querySelectorAll(".card__tab").forEach(t=>t.classList.remove('active'))

      tab.classList.add('active');
      activeTab = tab.dataset.value;
      perforChart.data.labels = dataPerfor[activeTab].data[0].data.map(
        (item) => item.title
      );
      perforChart.data.datasets = [
        {
          data: sumDataPerfor().map((item) => +item.value),
          backgroundColor: ["#0063be", "#009995", "#fec24c"],
          hoverOffset: 4,
        },
      ];
      perforList.innerHTML = perforItems();
      updateChartPerfor();
    })
  );

  const doughnutChart = document.getElementById("performanceChart");
  const perforChart = new Chart(doughnutChart, {
    type: "doughnut",
    data: {
      labels: dataPerfor[activeTab].data[0].data.map((item) => item.title),
      datasets: [
        {
          data: (() => {
            let newData;
            if (window.datapickerValue) {
              newData = JSON.parse(
                JSON.stringify(
                  dataPerfor[activeTab].data.filter((d) =>
                    window.datapickerValue.includes(d.date)
                  )
                )
              );
            } else {
              newData = JSON.parse(JSON.stringify(dataPerfor[activeTab].data));
            }
            return newData
              .reduce((prev, curr) => {
                if (prev.length === 0) {
                  prev.push(...curr.data);
                } else {
                  curr.data.forEach((d, i) => {
                    prev[i].value = +prev[i].value + +d.value;
                  });
                }

                return prev;
              }, [])
              .map((item) => +item.value);
          })(),
          backgroundColor: ["#0063be", "#009995", "#fec24c"],
          hoverBackgroundColor: ["#0063be", "#009995", "#fec24c"],
          hoverBorderColor: ["#0063be", "#009995", "#fec24c"],
          hoverBorderWidth: 5,
          hoverOffset: 10,
        },
      ],
    },
    options: {
      cutout: "72%",
      layout: {
        padding: {
          left: 10, // Паддинг слева
        },
      },
      plugins: {
        legend: {
          position: "right",
          align: "center",
          labels: {
            usePointStyle: true, // Используем стили точек
            pointStyle: "circle", // Устанавливаем круг
            boxWidth: 7,
            boxHeight: 7,
          },
        },
      },
      elements: {
        arc: {
          hoverBorderWidth: 10, // Устанавливаем ширину границы при наведении
        },
      },
      hover: {
        mode: "nearest", // Режим наведения
        onHover: (e, elements) => {
          if (elements.length) {
            e.native.target.style.cursor = "pointer"; // Установка курсора
          } else {
            e.native.target.style.cursor = "default";
          }
        },
      },
    },
    plugins: [
      {
        id: "custom-text",
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          const width = chart.width;
          const height = chart.height;
          ctx.restore();
          const fontSize = 20;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.textBaseline = "middle";

          const text = dataPerfor[activeTab].title;
          const textX = Math.round((width - ctx.measureText(text).width) / 3.3);
          const textY = height / 2;

          const text2 =
            Math.floor(
              sumDataPerfor().reduce(
                (prev, curr) => (prev = +prev + +curr.value),
                0
              ) * 100
            ) /
            100 +
            "$";
          const textX2 = Math.round(
            (width - ctx.measureText(text2).width) / 3.3
          );
          const textY2 = height / 2 + fontSize + 2;

          ctx.fillText(text, textX, textY);
          ctx.fillText(text2, textX2, textY2);
          ctx.save();
        },
      },
    ],
  });

  function updateChartPerfor() {
    let newData;
    if (window.datapickerValue) {
      newData = JSON.parse(
        JSON.stringify(
          dataPerfor[activeTab].data.filter((d) =>
            window.datapickerValue.includes(d.date)
          )
        )
      );
    } else {
      newData = JSON.parse(JSON.stringify(dataPerfor[activeTab].data));
    }

    if (!newData.length) {
      newData = JSON.parse(JSON.stringify([dataPerfor[activeTab].data[0]]));

      newData[0].date = null;
      newData[0].data = newData[0].data.map((e) => {
        e.value = 0.01;

        if (e.data) {
          e.data = e.data.map((r) => {
            r.value = 0;
            return r;
          });
        }

        return e;
      });
    }

    perforChart.data.datasets[0].data = newData
      .reduce((prev, curr) => {
        if (prev.length === 0) {
          prev.push(...curr.data);
        } else {
          curr.data.forEach((d, i) => {
            prev[i].value = +prev[i].value + +d.value;
          });
        }

        return prev;
      }, [])
      .map((item) => +item.value);

    perforChart.data.datasets[0].backgroundColor = [
      "#0063be",
      "#009995",
      "#fec24c",
    ];
    perforChart.data.datasets[0].hoverBackgroundColor = [
      "#0063be",
      "#009995",
      "#fec24c",
    ];
    perforChart.data.datasets[0].hoverBorderColor = [
      "#0063be",
      "#009995",
      "#fec24c",
    ];
    perforChart.data.datasets[0].hoverBorderWidth = 5;
    perforChart.data.datasets[0].hoverOffset = 10;

    perforChart.update();
  }

  window.updateAll = () => {
    updateChartMetric();
    perforList.innerHTML = perforItems();
    updateChartPerfor();
    renderWidgets();
    window.traffic = 0;
  };

  function convertDates(dates) {
    return dates.map((date) => {
      const [day, month, year] = date.split(".");
      const formattedDate = new Date(`${year}-${month}-${day}`);
      return formattedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
    });
  }
  function convertDate(date) {
    const [day, month, year] = date.split(".");
    const formattedDate = new Date(`${year}-${month}-${day}`);
    return formattedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
  }
}

init()

function getDateBefore(date, traffic) {
  let dates = date.split(",");
  let firstDate = new Date(dates[0].split(".").reverse().join("-"));

  // Получаем массив из `traffic` предыдущих дней
  let pastDates = [];
  for (let i = 1; i <= traffic; i++) {
    let previousDate = new Date(firstDate);
    previousDate.setDate(firstDate.getDate() - i);
    let formattedDate = previousDate
      .toISOString()
      .slice(0, 10)
      .split("-")
      .reverse()
      .join(".");
    pastDates.push(formattedDate);
  }

  return pastDates;
}

//< " CONNECTING JS COMPONENTS " >=============================================================================================================>//
// SPOILERS
const spollersArray = document.querySelectorAll("[data-spollers]");

if (spollersArray.length > 0) {
  // Получение обычных спойлеров
  const spollersRegular = Array.from(spollersArray).filter(function (
    item,
    index,
    self
  ) {
    return !item.dataset.spollers.split(",")[0];
  });
  // Инициализация обычных спойлеров
  if (spollersRegular.length > 0) {
    initSpollers(spollersRegular);
  }

  // Получение спойлеров с медиа запросами
  const spollersMedia = Array.from(spollersArray).filter(function (
    item,
    index,
    self
  ) {
    return item.dataset.spollers.split(",")[0];
  });

  // Инициализация спойлеров с медиа запросами
  if (spollersMedia.length > 0) {
    const breakpointsArray = [];
    spollersMedia.forEach((item) => {
      const params = item.dataset.spollers;
      const breakpoint = {};
      const paramsArray = params.split(",");
      breakpoint.value = paramsArray[0];
      breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
      breakpoint.item = item;
      breakpointsArray.push(breakpoint);
    });

    // Получаем уникальные брейкпоинты
    let mediaQueries = breakpointsArray.map(function (item) {
      return (
        "(" +
        item.type +
        "-width: " +
        item.value +
        "px)," +
        item.value +
        "," +
        item.type
      );
    });
    mediaQueries = mediaQueries.filter(function (item, index, self) {
      return self.indexOf(item) === index;
    });

    // Работаем с каждым брейкпоинтом
    mediaQueries.forEach((breakpoint) => {
      const paramsArray = breakpoint.split(",");
      const mediaBreakpoint = paramsArray[1];
      const mediaType = paramsArray[2];
      const matchMedia = window.matchMedia(paramsArray[0]);

      // Объекты с нужными условиями
      const spollersArray = breakpointsArray.filter(function (item) {
        if (item.value === mediaBreakpoint && item.type === mediaType) {
          return true;
        }
      });
      // Событие
      matchMedia.addListener(function () {
        initSpollers(spollersArray, matchMedia);
      });
      initSpollers(spollersArray, matchMedia);
    });
  }
  // Инициализация
  function initSpollers(spollersArray, matchMedia = false) {
    spollersArray.forEach((spollersBlock) => {
      spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
      if (matchMedia.matches || !matchMedia) {
        spollersBlock.classList.add("_init");
        initSpollerBody(spollersBlock);
        spollersBlock.addEventListener("click", setSpollerAction);
      } else {
        spollersBlock.classList.remove("_init");
        initSpollerBody(spollersBlock, false);
        spollersBlock.removeEventListener("click", setSpollerAction);
      }
    });
  }
  // Работа с контентом
  function initSpollerBody(spollersBlock, hideSpollerBody = true) {
    const spollerTitles = spollersBlock.querySelectorAll("[data-spoller]");
    if (spollerTitles.length > 0) {
      spollerTitles.forEach((spollerTitle) => {
        if (hideSpollerBody) {
          spollerTitle.removeAttribute("tabindex");
          if (!spollerTitle.classList.contains("_active")) {
            spollerTitle.nextElementSibling.hidden = true;
          }
        } else {
          spollerTitle.setAttribute("tabindex", "-1");
          spollerTitle.nextElementSibling.hidden = false;
        }
      });
    }
  }
  function setSpollerAction(e) {
    const el = e.target;
    if (el.hasAttribute("data-spoller") || el.closest("[data-spoller]")) {
      const spollerTitle = el.hasAttribute("data-spoller")
        ? el
        : el.closest("[data-spoller]");
      const spollersBlock = spollerTitle.closest("[data-spollers]");
      const oneSpoller = spollersBlock.hasAttribute("data-one-spoller")
        ? true
        : false;
      if (!spollersBlock.querySelectorAll("._slide").length) {
        if (oneSpoller && !spollerTitle.classList.contains("_active")) {
          hideSpollersBody(spollersBlock);
        }
        spollerTitle.classList.toggle("_active");
        _slideToggle(spollerTitle.nextElementSibling, 500);
      }
      e.preventDefault();
    }
  }
  function hideSpollersBody(spollersBlock) {
    const spollerActiveTitle = spollersBlock.querySelector(
      "[data-spoller]._active"
    );
    if (spollerActiveTitle) {
      spollerActiveTitle.classList.remove("_active");
      _slideUp(spollerActiveTitle.nextElementSibling, 500);
    }
  }
}

let _slideUp = (target, duration = 500) => {
  if (!target.classList.contains("_slide")) {
    target.classList.add("_slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = target.offsetHeight + "px";
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = true;
      target.style.removeProperty("height");
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("_slide");
    }, duration);
  }
};
let _slideDown = (target, duration = 500) => {
  if (!target.classList.contains("_slide")) {
    target.classList.add("_slide");
    if (target.hidden) {
      target.hidden = false;
    }
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("_slide");
    }, duration);
  }
};
let _slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return _slideDown(target, duration);
  } else {
    return _slideUp(target, duration);
  }
};
