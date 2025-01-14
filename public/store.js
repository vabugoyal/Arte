//First Javascript implementation
import Cart, { getCartFromLocal } from "/cart.js";


//Adds an event listener for when the webpage is finished loading
if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
  //if it is not loading then proceed to run the script
} else {
  ready();
}




//ADD EVENT LISTENERS TO OBJECTS
//------------------------------
//if the event occurs, then run respective function

function ready() {
  //the document object: variable that stores all HTML on it
  //there are methods for querying elements, attributes, and properties with it

  var removeCartItemButtons = document.getElementsByClassName("btn-danger");
  for (var i = 0; i < removeCartItemButtons.length; i++) {
    var button = removeCartItemButtons[i];
    //event listener return an event object with info inside of the function it calls
    button.addEventListener("click", removeCartItem);
  }

  var quantityInputs = document.getElementsByClassName("cart-quantity-input");
  for (var i = 0; i < quantityInputs.length; i++) {
    var input = quantityInputs[i];
    //event listener return an event object with info inside of the function it calls
    input.addEventListener("change", quantityChanged);
  }

  var addToCartButtons = document.getElementsByClassName("shop-item-button");
  for (var i = 0; i < addToCartButtons.length; i++) {
    var button = addToCartButtons[i];
    //event listener return an event object with info inside of the function it calls
    button.addEventListener("click", addToCartClicked);
  }

  document
    .getElementsByClassName("btn-purchase")[0]
    .addEventListener("click", purchaseClicked);


  
  let cart = getCartFromLocal()
  if( cart.length > 0 ) {
    cart.forEach((item) => {
      addItemToCart(item.title, item.price, item.imgSrc, item.id, item.quantity)
    });
    updateCartTotal();
  }


  let cartItems = document.getElementsByClassName("cart-items")[0];
  let rows = cartItems.getElementsByClassName("cart-row");
  document.onvisibilitychange = () => {
    if (document.visibilityState == "hidden") {
      const cart = new Cart();

      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let id = row.dataset.itemId;
        let imgSrc = row.getElementsByClassName("cart-item-image")[0].src;
        let title = row.getElementsByClassName("cart-item-title")[0].innerText;
        let price = row.getElementsByClassName("cart-price")[0].innerText;
        let quantity = row.getElementsByClassName("cart-quantity-input")[0].value;
        cart.add(title, price, quantity, imgSrc, id)
        console.log(cart)

      }

      cart.saveCartLocally();
    }
  }

}





//purchase clicked will remove all items and alert the user that they purchased
function purchaseClicked() {
  // alert("Thank you for your purchase")

  // Get the Total Price
  var priceElement = document.getElementsByClassName("cart-total-price")[0];
  // Convert from String to Float
  var price = parseFloat(priceElement.innerText.replace("$", "")) * 100;
  // Open the stripe handler and send the price
  // stripeHandler.open({
  //   amount: price,
  // });

  if( !price ){
    alert("Add Items to Purchase");
    return;
  }


  var items = [];
  var cartItemsContainer = document.getElementsByClassName("cart-items")[0];
  var cartRows = cartItemsContainer.getElementsByClassName("cart-row");
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i];
    // get the quantity input element
    var quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input"
    )[0];
    // set input value to instance variable
    var quantity = quantityElement.value;
    // set id valuse to instance variable
    var id = cartRow.dataset.itemId;
    // put items as object with id and quantity
    items.push({
      id,
      quantity,
    });
  }

  fetch("/purchase", {
    // post request creates new resources
    method: "POST",
    // sending and requesting json
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    // sending message with id and quantity
    body: JSON.stringify({
      items: items,
    }),
  })
    .then((res) => {
      res.json()
      .then((data) => {
        var cartItems = document.getElementsByClassName("cart-items")[0];
        //removes cart items while the cart still has items in it
        // while (cartItems.hasChildNodes()) {
        //   cartItems.removeChild(cartItems.firstChild);
        // }
        // updateCartTotal();
        window.location.href = data.url;
        alert(data.message);
      })
    })
    .catch((err) => {
      console.error(err);
    });

}



//removes cart item if "remove" is clicked
function removeCartItem(event) {
  //the event object has properties
  //we are using target to specify which button to address (the one clicked)
  var buttonClicked = event.target;

  //selecting the parent's parent to select the entire row to remove
  buttonClicked.parentElement.parentElement.remove();

  //updates every time that the remove cart button is selected
  updateCartTotal();
}

//function that takes user input and restricts it to real, positive numbers
//and to change the price of the whole purchase
function quantityChanged(event) {
  var input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  //update total price
  updateCartTotal();
}

//function to add items to the cart if "add to cart" is clicked
function addToCartClicked(event) {
  //add to cart button that was clicked
  var button = event.target;

  //getting the parent's parent which is the cart item
  var shopItem = button.parentElement.parentElement;

  //getting the info needed from the menu item
  var title = shopItem.getElementsByClassName("shop-item-title")[0].innerText;
  var price = shopItem.getElementsByClassName("shop-item-price")[0].innerText;
  var imageSrc = shopItem.getElementsByClassName("shop-item-image")[0].src;
  var id = shopItem.dataset.itemId;

  //calling new function to add item to cart
  addItemToCart(title, price, imageSrc, id);
  updateCartTotal();
}

//takes menu item info and creates a cart item
function addItemToCart(title, price, imageSrc, id, quantity) {

  let quantityMax = quantity || 1

  //creates a new div element with needed classes added
  var cartRow = document.createElement("div");
  cartRow.classList.add("cart-row");
  // assign an id to cartRows
  cartRow.dataset.itemId = id;
  //getting the cart items
  var cartItems = document.getElementsByClassName("cart-items")[0];

  //checking if cart item is already added
  var cartItemsNames = cartItems.getElementsByClassName("cart-item-title");
  for (var i = 0; i < cartItemsNames.length; i++) {
    if (cartItemsNames[i].innerText == title) {
      alert("This item is already added to the cart");
      return;
    }
  }

  //defining the html to go in the row
  var cartRowContents = `
        <div class = "cart-item cart-column">
          <img class = "cart-item-image" src="${imageSrc}">
          <span class="cart-item-title">${title}</span>
        </div>
        <span class = "cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="${quantityMax}">
            <button class="btn btn-danger" role="button">REMOVE</button>
        </div>`;

  //putting the row contents (html) in the row
  cartRow.innerHTML = cartRowContents;

  //appending the row the end of cart items
  cartItems.append(cartRow);
  cartRow
    .getElementsByClassName("btn-danger")[0]
    .addEventListener("click", removeCartItem);
  cartRow
    .getElementsByClassName("cart-quantity-input")[0]
    .addEventListener("change", quantityChanged);

  if( !quantity )
    alert("Added Item to cart");


}




//function to update the total price in the cart (helper function)
function updateCartTotal() {
  //first must get all cart rows by accessing all items then all the cart rows
  var cartItemContainer = document.getElementsByClassName("cart-items")[0];
  var cartRows = cartItemContainer.getElementsByClassName("cart-row");

  //set a total to sum up all the prices
  var total = 0;

  //loop through all the cart rows and sum up the total price of all objects in cart
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i];
    var priceElement = cartRow.getElementsByClassName("cart-price")[0];
    var quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input"
    )[0];

    //getting the price string without the dollar sign and converting it to an # (parseFloat)
    var price = parseFloat(priceElement.innerText.replace("$", ""));

    //getting the value out of the input element (quantityElement)
    var quantity = quantityElement.value;

    total = total + price * quantity;
  }

  total = Math.round(total * 100) / 100;
  document.getElementsByClassName("cart-total-price")[0].innerText =
    "$" + total;
}
