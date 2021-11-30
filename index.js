/*
	+--------------------+
	| App Initialization |
	+--------------------+
*/

//initialize and create the dexie database based indexedDb
const db = new Dexie('EseShoppingApp')

db.version(4).stores({
	items: '++id, name, price, isPurchased',
})

//reference the dom elements we are working with
const pageLoader = document.getElementById('pageLoader')
const appOptionsModalToggler = document.getElementById('appOptionsModalToggler')
const appOptionsModal = document.getElementById('appOptionsModal')
const appOverlay = document.getElementById('appOverlay')
const itemForm = document.getElementById('itemForm') 
const itemFormMode = document.getElementById('itemFormMode')
const itemFormToggler = document.getElementById('itemFormToggler')
const itemsDiv = document.getElementById('itemsDiv')
const currentItemEditing = document.getElementById('currentItemEditing')
const totalPriceDiv = document.getElementById('totalPriceDiv')
const unpurchasedPriceDiv = document.getElementById('balancePriceDiv')
const selectAllButton = document.getElementById('selectAllButton')
const deleteSelectedButton = document.getElementById('deleteSelectedButton')
const purchaseAllButton = document.getElementById('purchaseAllButton')
const purchaseSelectedButton = document.getElementById('purchaseSelectedButton')
const unPurchaseSelectedButton = document.getElementById('unPurchaseSelectedButton')

// temporary global variables 
let selectedItems = new Array()
let toastIsActive = false

/*
	+-----------------------------------+
	| Button Events And Functionalities |
	+-----------------------------------+
*/

// Assigning functions needed to be loaded on page loaded to the window.onload event
window.onload = async () => {
	await populateItemsDiv()

	pageLoader.classList.add('hidden')
}

// Adding onclick event to enable the appOptionsModalToggler button toggle modal on click
appOptionsModalToggler.onclick = async event => {
	let togglerIcon = event.currentTarget.querySelector('span')

	appOptionsModal.classList.toggle('active')
	appOverlay.onclick = () => appOptionsModalToggler.click()
	
	if (appOptionsModal.classList.contains('active')) {
		appOverlay.classList.remove('hidden')
		togglerIcon.classList.add('active')

	} else {
		appOverlay.classList.add('hidden')
		togglerIcon.classList.remove('active')
	}
}

// Handling item form
itemForm.onsubmit = async (event) => {
	event.preventDefault()

	const name = escapeHTML(document.getElementById('nameInput').value)
	const quantity = document.getElementById('quantityInput').value
	const price = document.getElementById('priceInput').value
	const currentItemEditingId = Number(currentItemEditing.value)
	let alertMessage = 'Created!'

	if (itemFormMode.value == 'create') {
		await db.items.add({
			name,
			quantity,
			price
		})

	} else if (itemFormMode.value == 'edit') {
		if (await db.items.get(currentItemEditingId)) {
			await db.items.update(currentItemEditingId, {
				name,
				quantity,
				price
			})
	
			alertMessage = 'Updated!'
		} else {
			alertMessage = 'Sorry, item has been deleted!'
		}
		untoggleItemEdit()
	}

	await populateItemsDiv()

	itemForm.reset()
	toastMessage(alertMessage)
}

// Adds functionality of toggling between hiding and unhiding itemForm to the itemFormToggler element
itemFormToggler.onclick = async (event) => {
	event.currentTarget.classList.toggle('active')
	itemForm.classList.toggle('hidden')

}

// Adds functionality of dleleting all selected items once to the deleteSelectedButton
deleteSelectedButton.onclick = async () => {
	let arrayOfSelectedItemIds = selectedItems.map(itemKey => Number(itemKey.replace('item_', '')))

	arrayOfSelectedItemIds.forEach(id => {
		removeItem(id)
		toggleSelect(id)
		selectAllButton.classList.remove('items-are-selected')
	})

	toastMessage('Deleted!')
}

// Adds functionality of purchasing all items once to the purchaseAllButton
purchaseAllButton.onclick = async () => {
	const allItems = await db.items.reverse().toArray()
	let arrayOfItemIds = allItems.map(item => item.id)

	if (arrayOfItemIds.length < 1) {
		return toastMessage('Sorry, There are no items to Purchase!', 2000)
	}

	arrayOfItemIds.forEach(async id => await changeItemPurchaseStatus(id, true))

	await populateItemsDiv()
	toastMessage('Purchased!')
}

// Adds functionality of purchasing all selected items to the purchaseSelectedButton
purchaseSelectedButton.onclick = async ()=> {
	let arrayOfSelectedItemIds = selectedItems.map(itemKey => Number(itemKey.replace('item_', '')))

	arrayOfSelectedItemIds.forEach(async id => await db.items.update(id, {
		isPurchased: true
	}))
	await populateItemsDiv()
	toastMessage('Purchased!')
}

// Adds functionality of unpurchasing all selected items to the unPurchaseSelectedButton
unPurchaseSelectedButton.onclick = async ()=> {
	let arrayOfSelectedItemIds = selectedItems.map(itemKey => Number(itemKey.replace('item_', '')))

	arrayOfSelectedItemIds.forEach(async id => await db.items.update(id, {
		isPurchased: false
	}))
	await populateItemsDiv()
	toastMessage('UnPurchased!')
}

// Adds functionality of selectng all items once to the selectAllButton
selectAllButton.onclick = async (event) => {
	const allItems = await db.items.toArray()
	let arrayOfItemIds = allItems.map(item => item.id)

	if (arrayOfItemIds.length < 1) {
		return toastMessage('Sorry, There are no items to Select!', 2000)
	}

	if (selectedItems.length > 0) {
		selectAllButton.classList.remove('items-are-selected')
		selectedItems = new Array()

	} else {
		selectAllButton.classList.add('items-are-selected')
		arrayOfItemIds.forEach(id => selectedItems.push('item_' + id))
	}

	await populateItemsDiv()
}

/*
	+--------------------+
	| Constant Functions |
	+--------------------+
*/

//populating data to the items div
const populateItemsDiv = async () => {
	const allItems = await db.items.reverse().toArray()
 
	itemsDiv.innerHTML = allItems.map(item => `
		<div class="item ${item.isPurchased && 'purchased'} ${isSelected(item.id) && 'selected'}" ondblclick="toggleSelect(${item.id})">
			<input
				type="checkbox"
				class="checkbox"
				onchange="toggleItemStatus(event, ${item.id})"
				${item.isPurchased && 'checked'}
			/>
			
			<div class="item-info">
				<p class="name">${item.name}</p>
				<span>- &nbsp;</span>
				<p class="details">$${item.price} x ${item.quantity}</p>
			</div>

			<div class="item-action">
				<button onclick="toggleItemEdit(${item.id})" class="edit-button">
					<span class="icon">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
					</span>
				</button>

				<button onclick="removeItem(${item.id})" class="delete-button">
					<span class="icon">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					<span>
				</button>

			</div>
		</div>
	`).join('')

	if (allItems.length < 1) {
		itemsDiv.innerHTML = `
			<span class="nothing-yet">Nothing yet.</span>
			<small class="nothing-yet">click the plus (+) icon above to use the form to create a list </small>
		`
	}

	//getting all the prices of items
	const arrayOfPrices = allItems.map(item => item.price * item.quantity)

	//getting only the prices of unpurchased items
	const arrayOfUnpurchasedPrices = allItems.map(item => {
		if (item.isPurchased || isNaN(item.price)) {
			item.price = 0
		}
		return Number(item.price * item.quantity)
	})

	const totalPrice = arrayOfPrices.reduce((a, b) => a + b, 0).toFixed(2)
	const unpurchasedPrice = arrayOfUnpurchasedPrices.reduce((a, b) => a + b, 0).toFixed(2)

	totalPriceDiv.innerHTML = createPriceLabelDOM('Total', totalPrice)
	unpurchasedPriceDiv.innerHTML = createPriceLabelDOM('Unpurchased', unpurchasedPrice)

	toggleSelectionActions()
}

// deleting all items once
deleteAllItems = async () => {
	const allItems = await db.items.reverse().toArray()
	let arrayOfItemIds = allItems.map(item => item.id)

	if (arrayOfItemIds.length < 1) {
		return toastMessage('Sorry, There are no items to Delete!', 2000)
	}

	arrayOfItemIds.forEach(id => {
		removeItem(id)
		toggleSelect(id)
		selectAllButton.classList.remove('items-are-selected')
	})

	await populateItemsDiv()
	toastMessage('Deleted!')
}

// Function for changing the purchase status of a specified item based on the set "id"
const changeItemPurchaseStatus = async (id, purchaseStatus = true) => {
	await db.items.update(id, { isPurchased: purchaseStatus })

	await populateItemsDiv()
}

// Function for toggling between items status based on the set "id"
const toggleItemStatus = async (event, id) => {
	await db.items.update(id, {
		isPurchased: !!event.target.checked
	})

	await populateItemsDiv()
}

// Function for deleting an item based on the set "id"
const removeItem = async id => {
	await db.items.delete(id)

	await populateItemsDiv()
}

// Function for toggling the selection action buttons to active if there are any selections
const toggleSelectionActions = () => {
	let allSectionActionButtons = document.querySelectorAll('.selection-action')

	if (selectedItems.length > 0) {
		allSectionActionButtons.forEach(button => {
			button.classList.add('active')
			button.disabled = false
		})
	} else {
		allSectionActionButtons.forEach(button => {
			button.classList.remove('active')
			button.disabled = true
		})
	}
}

// Function for toggling the selection class to items based on the set "id"
const toggleSelect = async id => {
	let selectKey = 'item_' + id

	if (selectedItems.includes(selectKey)) {
		selectedItems = selectedItems.filter((itemKey) => itemKey != selectKey)
	} else {
		selectedItems.push(selectKey)
	}
	await populateItemsDiv()
}

// Function to check if item is selected based on its "id"
const isSelected = id => selectedItems.includes('item_' + id)

// Function to create the dom element for the price labels
const createPriceLabelDOM = (label, value) => {
	let priceLabelClass = 'red'

	if (Number(value) > 100) {
		priceLabelClass = 'yellow'

	}
	if (Number(value) > 200) {
		priceLabelClass = 'green'

	}

	return `<span class="label">${label}:</span> <span class="value ${priceLabelClass}">$${value}</span>`
}

// Function for toggling edit mode for a specified item based on a set "id"
const toggleItemEdit = async id => {
	let currentItem = await db.items.get(id)

	itemFormMode.value = 'edit'
	currentItemEditing.value = id

	document.getElementById('nameInput').value = currentItem.name
	document.getElementById('quantityInput').value = currentItem.quantity
	document.getElementById('priceInput').value = currentItem.price
	document.getElementById('addItemButton').innerHTML = 'update'
	
	document.getElementById('nameInput').focus()

	if (itemForm.classList.contains('hidden')) {
		itemFormToggler.click()
	}
}

// Function for untoggling edit mode for specified item based on a set "id"
const untoggleItemEdit = () => {
	itemFormMode.value = 'create'
	currentItemEditing.value = 0

	itemForm.reset()
	document.getElementById('addItemButton').innerHTML = 'Add item'
}

// Function for creating a quick toast message
const toastMessage = (content, timeout = 1000) => {
	let toastModal = document.getElementById('toastModal')
	let modalContent = document.getElementById('modalContent')

	if (!toastIsActive) {
		toastModal.classList.add('active')
		modalContent.innerText = content

		setTimeout(() => {
			toastModal.classList.remove('active')
			toastIsActive = false
		}, timeout)

		toastIsActive = true
	}
}

// Function for escaping html that goes into the form input to rid the app of xss and html injsection
const escapeHTML = text => {
	return text
		.replace(/&/g, '&')
		.replace(/</g, '<')
		.replace(/>/g, '>')
		.replace(/"/g, '"')
		.replace(/'/g, '\'')
}
