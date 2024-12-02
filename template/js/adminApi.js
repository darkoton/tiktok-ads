const adminPanel = document.getElementById('admin');
const metricItem = function (data, key) {
  return data.map((el, index) => `
<tr class="bg-white border-b">  
<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
  <input placeholder="data" class="input" value="${el.x}" data-index="${index}" data-coll="metric" data-kit="${key}" data-key="x"  />
</th>
<td class="px-6 py-4">
  <input placeholder="data" class="input" value="${el.y}" data-index="${index}" data-coll="metric" data-kit="${key}" data-key="y"  />
</td>
<td class="px-6 py-4">
  <button data-index="${index}" data-coll="metric" data-kit="${key}" class="remove bg-red-600 p-2 rounded-[5px] text-[20px] text-white">Remove</button>
</td>
</tr>`,).join('') + `
<tr><td colspan="3" class="p-2 font-bold text-[25px] bg-white border-b">ADD</td></tr>
<tr class="parent bg-white border-b relative">  
<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
  <input placeholder="data" class="x" />
</th>
<td class="px-6 py-4">
  <input placeholder="data" class="y"   />
</td>
<td class="px-6 py-4">
  <button data-type="metric" data-coll="${key}" class="add bg-yellow-600 p-2 rounded-[5px] text-[20px] text-white">Add</button>
</td>
</tr>
`;
};

const perforItem = function (data, key) {
  return data.map((el, index) => `
<tr class="bg-white border-b">
<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
  <input placeholder="data" class="input" value="${el.date}" data-index="${index}" data-coll="performance" data-kit="${key}" data-key="value"  />
</th>
<td class="px-6 py-4">
</td>
<td class="px-6 py-4">
  <button data-index="${index}" data-coll="performance" data-kit="${key}" data-key="value" class="remove bg-red-600 p-2 rounded-[5px] text-[20px] text-white">Remove</button>
</td>
</tr>

${el.data
      ? el.data
        .map((e, i) => {
          return `<tr class="bg-white border-b"><th scope="row"class="px-6 pl-12 py-4 font-medium text-gray-900 whitespace-nowrap"><span>${e.title}</span></th><td class="px-6 py-4"><input placeholder="data" value="${e.value}"data-child="child"data-chIndex="${i}"data-index="${index}"data-coll="performance"data-kit="${key}"data-key="value"/>${e.units}</td></tr>${e.data ? e.data.map((l, i2) => {
            return `<tr class="bg-white border-b">
<th scope="row" class="px-6 pl-24 py-4 font-medium text-gray-900 whitespace-nowrap">
      <span>${l.title}</span>
</th>
<td class="px-6 py-4">
  <input placeholder="data" class="input" value="${l.value}" data-child="child2" data-chIndex="${i}" data-chIndex2="${i2}" data-index="${index}" data-coll="performance" data-kit="${key}" data-key="value"  />${e.units}
</td>
</tr>
`;
          }).join('') : ''}`;
        })
        .join('')
      : ''
    }
`,).join('') + `

<tr><td colspan="3" class="p-2 font-bold text-[25px] bg-white border-b">ADD</td></tr>
<tr>
<td colspan="3">
<table class="parent w-full">
<tr class="bg-white border-b">
<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
  <input placeholder="data" class="date"   />
</th>
</tr>

${data[0].data
      .map((e, i) => {
        return `<tr class="bg-white border-b">
          <th scope="row"class="px-6 pl-12 py-4 font-medium text-gray-900 whitespace-nowrap">
          <span>${e.title}</span>
          </th>
          <td class="px-6 py-4">
          <input placeholder="data" data-value="${e.title}" />${e.units}
          </td>
          </tr>
          
          ${e.data ? e.data.map((l, i2) => {

          return `<tr class="bg-white border-b">
<th scope="row" class="px-6 pl-24 py-4 font-medium text-gray-900 whitespace-nowrap">
      <span>${l.title}</span>
</th>
<td class="px-6 py-4">
  <input placeholder="data" data-child="${e.title}" data-value="${l.title}" /> $
</td>
</tr>
`;
        }).join('') : ''}`;
      })
      .join('')

    }


<td class="px-6 py-4">
  <button data-type="perfor" data-coll="${key}" class="add bg-yellow-600 p-2 rounded-[5px] text-[20px] text-white">Add</button>
</td>
</table>
</td>
</tr>
`;
};


const template = function (title, collection, type) {

  return `
        <div class="flex flex-col gap-y-4">
          <h2 class="text-[30px] font-bold">${title}</h2>
        ${Object.keys(collection)
      .map(key => {
        return `<div class="relative bt-2 b-gray-500 overflow-x-auto">
       
        <div class="flex justify-between items-center">
        <h3 class="text-[20px] font-bold">${collection[key].title}</h3>
        <button data-widget="true" data-coll="metric" data-kit="${key}" class="remove bg-red-600 p-2 rounded-[5px] text-[20px] text-white">Remove</button>

        </div>
        <table class="bg-white w-full text-sm text-left rtl:text-right text-gray-500 ">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
        <th scope="col"class="px-6 py-3">Date or just title</th>
        <th scope="col"class="px-6 py-3">Value</th>
        <th scope="col"class="px-6 py-3">Action</th>
        </tr>
        </thead>
        <tbody>
        
        ${type === 'metric' ? metricItem(collection[key].data, key) : ''}
        ${type === 'perfor' ? perforItem(collection[key].data, key) : ''}
       
        </tbody>
        </table>
        </div>`;
      })
      .join('')
    +

    `
        ${type === 'metric' ? `
        
        <table class="bg-white w-full text-sm text-left rtl:text-right text-gray-500 ">
        <tbody>
        <tr class="parent">
          <td colspan="4" class="p-2 font-bold text-[25px] bg-white border-b">ADD WIDGET</td>
        </tr>
        <tr class="parent bg-white border-b relative">  
          <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
            <input placeholder="Title" class="title-widget" />
          </th>
          <td>
            <input placeholder="Description" class="desc-widget" />
          </td>
                    <td>
            <input placeholder="Units" class="units-widget" />
          </td>
          <td class="px-6 py-4">
            <button id="add-widget" class="bg-yellow-600 p-2 rounded-[5px] text-[20px] text-white">Add</button>
          </td>
        </tr>
        </tbody>
        </table>
        
        `: ''}
        `
    }  
        </div>`;
};


let timer = null;

function update() {
  fetch('/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

function updateData(dataset, v) {
  const {
    child,
    coll,
    kit,
    index,
    key,
    chindex,
    chindex2
  } = dataset;
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    if (child === 'child') {
      data[coll][kit].data[index].data[chindex].value = v;
    } else if (child === 'child2') {
      data[coll][kit].data[index].data[chindex].data[chindex2].value = v;
    } else {
      data[coll][kit].data[index][key] = v;
    }
    update()
  }, 500);
}

function deleteData(dataset) {
  const {
    child,
    coll,
    kit,
    index,
    key,
    chindex,
    chindex2,
    widget
  } = dataset;

  if (widget === 'true') {
    delete data[coll][kit]
  } else if (child === 'child') {
    // data[coll][kit].data[index].data[chindex].value = v;
  } else if (child === 'child2') {
    // data[coll][kit].data[index].data[chindex].data[chindex2].value = v;
  } else {
    data[coll][kit].data.splice(index, 1)
  }
  update()
  adminPanel.innerHTML = ''
  render()
}


function addData(dataset, button) {
  
  const {
    type, coll
  } = dataset;
 
  const parent = button.closest('.parent')
  if (type === 'metric') {    
    const x = parent.querySelector('.x').value
    const y = parent.querySelector('.y').value

    data.metric[coll].data.push({
      x,
      y
    })
  } else if (type === 'perfor') {
    const date = parent.querySelector('.date').value
    const inputs = parent.querySelectorAll('[data-value]:not([data-child])');

    data.performance[coll].data.push({
      date: date,
      data: Array.from(inputs).reduce((prev, curr) => {
        prev.push({
          title: curr.dataset.value,
          units: "$",
          value: curr.value,
          data: parent.querySelectorAll(`[data-child="${curr.dataset.value}"]`).length ?
            Array.from(parent.querySelectorAll(`[data-child="${curr.dataset.value}"]`)).reduce((p, c) => {
              p.push({
                title: c.dataset.value,
                units: "$",
                value: c.value,
              })
              return p
            }, [])
            : null
        })
        return prev
      }, [])
    });

  }

  update()
  adminPanel.innerHTML = ''
  render()
}

function addWidget({ target }) {
  const parent = target.closest('.parent')
  const title = parent.querySelector('.title-widget').value
  const desc = parent.querySelector('.desc-widget').value
  const units = parent.querySelector('.units-widget').value
  data.metric[title] = {
    title: title,
    desc: desc,
    units: units,
    data: []
  }
  update()
  adminPanel.innerHTML = ''
  render()
}

function render() {
  adminPanel.innerHTML += template('Metric key', data.metric, 'metric');
  adminPanel.innerHTML += template('Performance breakdown', data.performance, 'perfor');


  setTimeout(() => {
   
    document.querySelectorAll('.input').forEach(input => {
      input.addEventListener('input', event => {
        updateData(input.dataset, event.target.value);
      });
    })

    document.querySelectorAll('.remove').forEach(button => {
      button.addEventListener('click', () => deleteData(button.dataset))
    })

    document.querySelectorAll('.add').forEach(button => {
      button.addEventListener('click', () => addData(button.dataset, button))
    })

    document.querySelector('#add-widget').addEventListener("click", addWidget)
  }, 700);
}

let data;
fetch('/data', {
  method: 'GET',
}).then(res => {
  res.json().then(result => {
    data = result;
    render()
  });
})