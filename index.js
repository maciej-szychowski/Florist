// Variables
const btnBurger = document.querySelector('.hamburger');
const nav = document.querySelector(".navigation");
const photoGallery = document.querySelector(".photo-gallery");
const shoppingCartBtn = document.querySelector(".shopping-cart");
const shoppingBtnClose = document.querySelector(".close-cart")
const totalItems = document.querySelector(".shopping-cart span");
const cartTotal = document.querySelector(".cart-total");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItem = document.querySelector(".cart");
const cartContent = document.querySelector(".cart-content")
const clearCartBtn = document.querySelector(".clear-cart");
let cart = [];
let DOMbuttons = [];
//show and hide main menu
class MainMenu {
    showMenu(){
        this.classList.toggle('activeIcon');
        nav.classList.toggle('active');   
    }
}

//get products from json file
class Products {
    async getProducts(){
        try {
            let products = await fetch("products.json");
            products = await products.json();
            products = products.products;
            const allProducts = products.map(product => {
                const {id} = product.sys;
                const {title, price} = product;
                const image = product.image.url;
                return {id, title, price, image}
            })
           return allProducts;
        } catch(error) {
            console.log(error);
        }
    }
}


class UI {
// display all products    
    displayProducts(products) {
        let allProducts = "";
        products.map(product => {
         allProducts += `
            <article class="photo-gallery-inner">
                <div class="img-container">
                    <button class="price" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> 
                        add to bag 
                    </button>
                    <figure>
                        <img src="${product.image}" alt="white flowers">
                        <figcaption>${product.title}<p>$<span>${product.price}</span></p></figcaption>
                    </figure>
                </div>   
            </article> 
         `
        })
        photoGallery.innerHTML = allProducts;
    }
// get all buttons, save clicked product to storage 
    getAllButtons() {
        shoppingCartBtn.addEventListener("click",this.openCart);
        shoppingBtnClose.addEventListener("click",this.closeCart);
        const allButtons = [...document.querySelectorAll(".price")];
        DOMbuttons = allButtons;
        cart = Storage.getCart() ? Storage.getCart() : [];
        const products = Storage.getProducts();
        
        allButtons.forEach(button => {
            const id = button.dataset.id;
            const cartProducts = cart.find(product => product.id === id);
            if(cartProducts) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener("click", (event) => { 
                cart = Storage.getCart() ? Storage.getCart() : [];
                const cartItem = {...products.find(item => item.id === id),amount:1};
                cart = [...cart, cartItem];
                Storage.saveCart(cart);
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                event.target.style.color = "red";  
                this.totalPrice(cart);
                this.displayBoughtProduct(cartItem);
                this.openCart();
            })
        })
        clearCartBtn.addEventListener("click", () => this.removeAllProducts())
    }
// open shopping cart
    openCart() {
        cartOverlay.classList.add("transparentBcg");
        cartItem.classList.add("showCartShopping");
    }
// close shopping cart
    closeCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartItem.classList.remove("showCartShopping");
    }
//display total price and all items in shopping cart 
    totalPrice(cart){
        let allItems = 0;
        let totalPrice = 0;
        cart.map(product => {
            allItems += product.amount;
            totalPrice += product.amount * product.price;
        })
        totalItems.innerText = allItems;
        cartTotal.innerText = totalPrice;      
    }
//display bought products in cart
    displayBoughtProduct(product) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
            div.innerHTML = `
            <img src="${product.image}" alt="">

            <div>
                <h4>${product.title}</h4>
                <h5>$${product.price}</h5>
                <span class="remove-item" data-id=${product.id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${product.id}></i>
                <p class="item-amount">${product.amount}</p>
                <i class="fas fa-chevron-down" data-id=${product.id}></i>
            </div>
            `
        cartContent.appendChild(div);
    }
//update aplication
    updateApp() {
        cart = Storage.getCart() ? Storage.getCart() : [];
        this.totalPrice(cart);
        cart = cart.map(product => this.displayBoughtProduct(product));
    }
//remove products from cart
    removeAllProducts(){
        cartContent.innerHTML = "";
        Storage.saveCart([]);
        this.updateApp();
        this.updateButtons()

    }
// update buttons
    updateButtons() {
        DOMbuttons.forEach(button =>{
            if(button.disabled){
                button.disabled = false;
                button.style.color = "rgba(255,255,255, 0.8)";
                button.innerHTML= `
                    <i class="fas fa-shopping-cart"></i> 
                    add to bag 
                `     
            }
        });      
    }
// change amount in cart and remove single product
    changeSingleProduct() {
        cartItem.addEventListener("click", (event) => {
            
            if(event.target.classList.contains("remove-item")) {
                const id = event.target.dataset.id;
                const item = event.target.parentElement.parentElement;
                item.remove();
                this.removeSingleProduct(id);    
            } else if(event.target.classList.contains("fa-chevron-up")) {
                const id = event.target.dataset.id;
                this.changeAmount(id,"add")
            } else if(event.target.classList.contains("fa-chevron-down")) {
                const id = event.target.dataset.id;
                this.changeAmount(id,"substract");
                
            }
        })
    }    
// remove single product
    removeSingleProduct(id) {
        cart = Storage.getCart() ? Storage.getCart() : [];
        cart = cart.filter(product => product.id !== id);
        Storage.saveCart(cart);
        this.totalPrice(cart); 
        this.updateSingleButton(id);  
    }
//update single button
    updateSingleButton(id) {
        const number = parseInt(id);      
        DOMbuttons[number-1].innerHTML = `
        <i class="fas fa-shopping-cart"></i> 
        add to bag 
        `
        DOMbuttons[number-1].disabled = false;
        DOMbuttons[number-1].style.color = "rgba(255,255,255, 0.8)";
    }
// change amount of single product in cart
    changeAmount(id,type) {    
        cart = Storage.getCart() ? Storage.getCart() : [];
        const item = cart.find(product => product.id === id);
        if(type === "add") {
            const amountItem = event.target.nextElementSibling;
            item.amount = item.amount + 1;
            amountItem.innerText = item.amount;
            this.totalPrice(cart);

        } else if(type === "substract") {
            const itemAmount = event.target.previousElementSibling;
            if(item.amount > 1) {
                item.amount = item.amount - 1;   
                itemAmount.innerText = item.amount;

            } else {
                this.removeSingleProduct(id);
                event.target.parentElement.parentElement.remove();
            }
            this.totalPrice(cart);
        }
        Storage.saveCart(cart);
    }        
}

// save products in local storage
class Storage {
    static saveAllProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        const products = JSON.parse(localStorage.getItem("cart"));
        return products;
    }
    static getProducts() {
        const products = JSON.parse(localStorage.getItem("products"));
        return products;
    }
}

function init(){
    
    
    const menu = new MainMenu();
    const products = new Products();
    const ui = new UI()
    btnBurger.addEventListener('click', menu.showMenu);
    products.getProducts().then((products) => {
        ui.displayProducts(products);
        Storage.saveAllProducts(products);
    }).then(() => {
        ui.getAllButtons();
        ui.updateApp();
        ui.changeSingleProduct();
    });

}


document.addEventListener("DOMContentLoaded", init());
