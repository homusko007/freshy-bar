import { API_URL, getFormData } from "./script.js";
const modalOrder = document.querySelector(".modal_order");
const orderCount = modalOrder.querySelector(".order__count");
const orderList = modalOrder.querySelector(".order__list");
const orderTotalPrice = modalOrder.querySelector(".order__total-price");
const orderForm = modalOrder.querySelector(".order__form");


export const cartDataControl = {
    getLocalStorage() {
        return JSON.parse(localStorage.getItem('freshyBarCart') || '[]');
    },

    addLocalStorage(item) {
        const cartData = this.getLocalStorage();
        item.idLocStor = Math.random().toString(36).substring(2, 8);
        cartData.push(item);
        localStorage.setItem('freshyBarCart', JSON.stringify(cartData));
        renderCountCart(cartData.length);
    },

    removeLocalStorage(idLocStor) {
        const cartData = this.getLocalStorage();
        const index = cartData.findIndex((item) => item.idLocStor === idLocStor);
        if (index !== -1) {
            cartData.splice(index, 1);
        }
        localStorage.setItem('freshyBarCart', JSON.stringify(cartData));
        renderCountCart(cartData.length);
    },
    clearLocalStorage() {
        localStorage.removeItem('freshyBarCart');
        renderCountCart(0);
    },
};

const renderCountCart = (count) => {
    const headerBtnOrder = document.querySelector(".header__btn-order");
    headerBtnOrder.dataset.count = count || cartDataControl.getLocalStorage().length;
  };
  
  renderCountCart();

const createCartItem = (item, data) => {
    const img = data.find((cocktail) => cocktail.title === item.title)?.image;
    const li = document.createElement('li');
    li.classList.add('order__item');
    li.innerHTML = `
    <img class="order__img" src="${
        img ? `${API_URL}${img}` : "img/make-your-own.jpg"
      }"
        alt="${item.title}">
              <div class="order__info">
                <h3 class="order__name">${item.title}</h3>

                <ul class="order__topping-list">
                  <li class="order__topping-item">${item.size}</li>
                  <li class="order__topping-item">${item.cup}</li>
                  ${
                    item.topping
                      ? Array.isArray(item.topping)
                        ? item.topping
                            .map(
                              (topping) =>
                                `<li class="order__topping-item">${topping}</li>`,
                            )
                            .toString()
                            .replace(",", "")
                        : `<li class="order__topping-item">${item.topping}</li>`
                      : ""
                  }
                </ul>
              </div>

              <button class="order__item-delete" data-idlocstor="${item.idLocStor}"
              aria-lable="удалить коктйль из корзины"></button>

              <p class="order__item-price">${item.price}&nbsp;₽</p>
            </li>
    `;
    return li;
};

const renderCartList = (data) => {
    const orderListData = cartDataControl.getLocalStorage(); 

    orderList.textContent = '';
    orderCount.textContent = `(${orderListData.length})`;

    orderListData.forEach(item => {
        orderList.append(createCartItem(item, data));
    });

    orderTotalPrice.textContent = `${orderListData.reduce(
        (acc, item) => acc + +item.price,
        0,)} ₽`;
};

const handlerSubmit = async (e) => {
    const orderListData = cartDataControl.getLocalStorage();

    e.preventDefault();
    
        if(!orderListData.length) {
            modalOrder.closeModal('close');
            alert('Корзина пуста!');
            orderForm.reset();
            modalOrder.closeModal("close");
            return;
        }

        const data = getFormData(orderForm);
        const response = await fetch(`${API_URL}api/order`, {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                products: orderListData,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const {message} = await response.json();

        alert(message);
        cartDataControl.clearLocalStorage();
        orderForm.reset();
        modalOrder.closeModal('close');
};

export const renderCart = (data) => {
    renderCartList(data);
    const orderList = document.querySelector('.order__list');
    const orderForm =  document.querySelector('.order__form');

    orderForm.addEventListener("submit", handlerSubmit);

    orderList.addEventListener("click", (e) => {
        if (e.target.classList.contains("order__item-delete")) {
          cartDataControl.removeLocalStorage(e.target.dataset.idlocstor);
          renderCartList(data);
        }
      });
    };
