$(document).ready(function() {
    $('#my-form').submit(function(event) {
      event.preventDefault(); // prevent default form submission
      const formData = $(this).serialize(); // get form data as string
      $('#loader').toggle()
      $.post('/api/submit', formData, function(result) {
       // Reload the current page
      window.location.reload();
      });
    });
  });