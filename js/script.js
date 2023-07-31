import { renderCart, cartDataControl } from "./cart.js";

export const API_URL = 'https://sun-crawling-basin.glitch.me/';

const price = {
Клубника: 60,
Банан: 50,
Манго: 70,
Киви: 55,
Маракуйя: 90,
Яблоко: 45,
Мята: 50,
Лед: 10,
Биоразлагаемый: 20,
Плястиковый: 0,
};

const getData = async () => {
    const response = await fetch(`${API_URL}api/goods`);

    const data = await response.json();
    return data;
}

const createCard = item => {
   const cocktail = document.createElement('article');
   cocktail.classList.add('cocktail'); 

   cocktail.innerHTML = `
    <img src="${API_URL}${item.image}"
        alt="коктейть ${item.title}" 
        class="coctail__img"
        width="256" 
        height="304">
    <div class="cocktail__content">
        <div class="cocktail__text">
            <h3 class="cocktail__title">${item.title}</h3>
            <p class="cocktail__price text-red">${item.price} ₽</p>
            <p class="cocktail__size">${item.size}</p>
        </div>
        <button class="btn cocktail__btn  cocktail__btn_add" data-id="${item.id}">Добавить</button>
    </div>
   `;

   return cocktail;
};

// объект с методами, но можно создать и функцию
// для блокировки скролла страницы при открытой модалке
const scrollService = {
    scrollPosition: 0,

    disabledScroll() {
       this.scrollPosition = window.scrollY;
       //documentElement - это html убираем скачок 
       document.documentElement.style.scrollBehavior = "auto";
       
       document.body.style.cssText = `
       overflow: hidden;
       position: fixed;
       top: -${this.scrollPosition}px;
       left: 0;
       height: 100vh;
       width: 100vw;
       padding-right: ${window.innerWidth - document.body.offsetWidth}px; 
       `;//padding-right - это размер скролла
    },
    enabledScroll() {
        document.body.style.cssText = "";
        window.scroll({ top: this.scrollPosition});
        document.documentElement.style.scrollBehavior = "";
    },
}

const modalController = ({modal, btnOpen, time = 300, open, close}) => {
    const buttonElems = document.querySelectorAll(btnOpen);
    const modalElem = document.querySelector(modal);

    modalElem.style.cssText = `
    display: flex;
    visibility: hidden;
    opacity: 0;
    transition: opacity ${time}ms ease-in-out;
    `;

    const closeModal = (event) => {
        const target = event.target;
        const code = event.code;

        if (event === "close" || target === modalElem || code === 'Escape') {
        modalElem.style.opacity = 0;
        //т.к. hidden нельзя применять пока не применилось opacity
        // отложим его на несколько сек.
        setTimeout(() => {
            modalElem.style.visibility = 'hidden';
            scrollService.enabledScroll();

            if (close) {
                close();
            }
        }, time);

        window.removeEventListener('keydown', closeModal);
    }
    };

    const openModal = (e) => {
        if (open) {
            open({ btn: e.target })
        };

        modalElem.style.visibility = 'visible';
        modalElem.style.opacity = 1;
        window.addEventListener('keydown', closeModal);
        scrollService.disabledScroll();
        };

        buttonElems.forEach(buttonElem => {
            buttonElem.addEventListener('click', openModal);
        })
        modalElem.addEventListener('click', closeModal);

        modalElem.closeModal = closeModal;
        modalElem.openModal = openModal;

    return { openModal, closeModal };
};

export const getFormData = (form) => {
    const formData = new FormData(form);
    const data = {};
    for (const [name, value] of formData.entries()) {
        if (data[name]) {
            if (!Array.isArray(data[name])) {
                data[name] = [data[name]]
            }
            data[name].push(value)
        } else {
            data[name] = value;
        }
    }
    return data;
};

const calculateTotalPrice = (form, startPrice) => {
    let totalPrice = startPrice;

    const data = getFormData(form);

    if (Array.isArray(data.ingredient)) {
        data.ingredient.forEach(item => {
            totalPrice += price[item] || 0;
        })
    } else {
        totalPrice += price[data.ingredient] || 0;
    };

    if (Array.isArray(data.topping)) {
        data.topping.forEach(item => {
            totalPrice += price[item] || 0;
        })
    } else {
        totalPrice += price[data.topping] || 0;
    };

    totalPrice += price[data.cup] || 0;

    return totalPrice;
};

const formControl = (form, cb) => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = getFormData(form);
        cartDataControl.addLocalStorage(data);
        if (cb) {
            cb();
        }
    });
};

const calculateMakeYourOwn = () => {
    const modalMakeOwn = document.querySelector('.modal_make-your-own')
    const formMakeOwn = document.querySelector('.make__form_make-your-own');
    const makeInputTitle = document.querySelector('.make__input-title');
    const makeInputPrice = document.querySelector('.make__input_price');
    const makeTotalPrice = document.querySelector('.make__total-price');
    const makeAddBtn = document.querySelector('.make__add-btn');

    const handlerChange = () => {
        const totalPrice = calculateTotalPrice(formMakeOwn, 150);

        const data = getFormData(formMakeOwn);

        if (data.ingredient) {
            const ingredient = Array.isArray(data.ingredient)
            ? data.ingredient.join(',')
            : data.ingredient;
            makeInputTitle.value = `Конструктор: ${ingredient}`;
            makeAddBtn.disabled = false;
        } else {
            makeAddBtn.disabled = true; 
        }

        makeInputPrice.value = totalPrice;
        makeTotalPrice.textContent = `${totalPrice} ₽`;
    }

    formMakeOwn.addEventListener('change', handlerChange);
    formControl(formMakeOwn, () => {
        modalMakeOwn.closeModal("close");
    });
    handlerChange();

   const resetForm = () => {
        makeTotalPrice.textContent = "";
        makeAddBtn.disabled = true;
        formMakeOwn.reset();
      };

      return { resetForm };
};

const calculateAdd = () => {
  const modalAdd = document.querySelector(".modal_add");
  const formAdd = document.querySelector(".make__form_add");
  const makeTitle = modalAdd.querySelector(".make__title");
  const makeInputTitle = modalAdd.querySelector(".make__input-title");
  const makeTotalPrice = modalAdd.querySelector(".make__total-price");
  const makeInputStartPrice = modalAdd.querySelector(
    ".make__input-start-price",
  );
  const makeInputPrice = modalAdd.querySelector(".make__input-price");
  const makeTotalSize = modalAdd.querySelector(".make__total-size");
  const makeInputSize = modalAdd.querySelector(".make__input-size");

  const handlerChange = () => {
    const totalPrice = calculateTotalPrice(formAdd, +makeInputStartPrice.value);
    makeInputPrice.value = totalPrice;
    makeTotalPrice.textContent = `${totalPrice} ₽`;
  };

  formAdd.addEventListener("change", handlerChange);
  formControl(formAdd, () => {
    modalAdd.closeModal('close');
  });
 

  const fillInForm = (data) => {
    makeTitle.textContent = data.title;
    makeInputTitle.value = data.title;
    makeTotalPrice.textContent = `${data.price} ₽`;
    makeInputStartPrice.value = data.price;
    makeInputPrice.value = data.price;
    makeTotalSize.textContent = data.size;
    makeInputSize.value = data.size;
    handlerChange();
  };

  const resetForm = () => {
    makeTitle.textContent = "";
    makeTotalPrice.textContent = "";
    makeTotalSize.textContent = "";
    formAdd.reset();
  };

  return { fillInForm, resetForm };
};

const init = async () => {
    const goodsListElem = document.querySelector(".goods__list");
    const data = await getData();

    const cardsCocktail = data.map((item) => {
    const li = document.createElement('li');
    li.classList.add('goods__item');
    li.append(createCard(item, data));

    return li;
    })
    
    goodsListElem.append(...cardsCocktail);

    modalController({
        modal: '.modal_order', 
        btnOpen: '.header__btn-order',
        open() { 
            renderCart(data);
        },
    });

    const { resetForm: resetFormMakeYourOwn } = calculateMakeYourOwn();

    modalController({
        modal: '.modal_make-your-own',
        btnOpen: '.cocktail__btn_make',
        close: resetFormMakeYourOwn,
    });

 const { fillInForm: fillInFormAdd, resetForm: resetFormAdd } = calculateAdd();

  modalController({
    modal: ".modal_add",
    btnOpen: ".cocktail__btn_add",
    open({ btn }) {
      const id = btn.dataset.id;
      const item = data.find((item) => item.id.toString() === id);
      fillInFormAdd(item);
    },
    close: resetFormAdd,
  });
};


init();
