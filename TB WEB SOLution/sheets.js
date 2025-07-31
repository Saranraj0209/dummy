const scriptURL = 'https://script.google.com/macros/s/AKfycbxUPr77PuW4IRYGVwJrm2onVqO6qlyi99YJ05FUFQ8CZtiAunFYxDkwEg5v9O3TQQ0-/exec'

const form = document.forms['contact-form']

form.addEventListener('submit', e => {
  
  e.preventDefault()
  
  fetch(scriptURL, { method: 'POST', body: new FormData(form)})
  .then(response => alert("Thank you! Form is submitted" ))
  .then(() => { window.location.reload(); })
  .catch(error => console.error('Error!', error.message))
})