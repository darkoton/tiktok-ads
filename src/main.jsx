import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { DatePicker, ConfigProvider } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import "./style.css";
import dayjs from "dayjs";
import enUS from "@arco-design/web-react/es/locale/en-US";

function getDatesBetween(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(currentDate.toISOString().split("T")[0]); // Добавляем дату в формате YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1); // Переходим к следующему дню
  }
  return dates;
}

function Prefix({ counter }) {
  return (
    <div className="analytic-head__period-days">
      <span id="daysCounter">{counter}</span> days:
    </div>
  );
}

function DatePickerCustom() {
  const [counter, setCounter] = useState(0);

  function update(dates) {
    dates = getDatesBetween(...dates)
      .map((d) => new Date(d).toLocaleDateString())
      .join(",");

    setCounter(dates.split(",").length);

    window.datapickerValue = dates;
    window.updateAll();
  }

  return (
    <DatePicker.RangePicker
      prefix={<Prefix counter={counter} />}
      allowClear={false}
      onChange={update}
      style={{ width: 300 }}
      shortcutsPlacementLeft
      shortcuts={[
        {
          text: "Today",
          value: () => {
            window.traffic = 1;
            return [dayjs(), dayjs().add(0, "day")];
          },
        },
        {
          text: "Last 7 days",
          value: () => {
            window.traffic = 7;
            return [dayjs(), dayjs().add(-6, "day")];
          },
        },
        {
          text: "Last 28 days",
          value: () => {
            window.traffic = 28;
            return [dayjs(), dayjs().add(-27, "day")];
          },
        },
      ]}
    />
  );
}

createRoot(document.getElementById("datepicker")).render(
  <StrictMode>
    <ConfigProvider locale={enUS}>
      <DatePickerCustom />
    </ConfigProvider>
  </StrictMode>
);
