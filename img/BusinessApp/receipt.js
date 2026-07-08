const table = document.querySelector('.orders-table')
const addFieldBtn = table.querySelector('.add-field')
const field = document.querySelector('.field')
const select = document.querySelector('.pid-select')

let unitPrice = document.querySelector('.up').textContent
let itemName = document.querySelector('.item-name').textContent

let fieldArray = [['po1', 'pig feed', 20000]]
const addField = function () {
    let row = document.createElement('tr')
row.classList.add('field')
row.innerHTML = `<tr class="field">
                    <td>
                    
                    </td>
                    <td>
                      <select name="PID" id="" class="pid-select">
                      <option value="p01"> <h4 class="bold">p01</h4></option>
                      <option value="g63">g63</option>
                      <option value="f11">f11</option>
                      <option value="RCM">RCM</option>
                      <option value="YCm">YCm</option>
                      </select>
                    </td>

                    <td class="item-name"><h4 class="bold">-</h4></td>
                    <td><input type="number"></td>
                    <td class="up"><h4 class="bold">-</h4></td>
                    <td class="tp"><h4 class="bold">-</h4></td>
                    <td></td>
                  </tr> `
    table.insertAdjacentElement('beforeEnd', row)
    table.removeChild()
    // alert('hi')
}
addFieldBtn.addEventListener('click', addField)
// console.log(select.options)
let o = select.options
let optionsArray = Array.from(o)
console.log(o)
optionsArray.forEach(option => {
  console.log(option.value)
});