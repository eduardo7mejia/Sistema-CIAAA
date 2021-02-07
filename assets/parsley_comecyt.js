$(document).ready(function(){
  window.Parsley.addValidator('alpha_space', {
      validateString: function validateString(value) {
        return /^[a-záéíóúñ ]+$/i.test(value);
      },
      messages: {
        en: 'This value should be alphanumeric',
        es: 'Este valor debe ser alfanumérico.'
      }
   });

   window.Parsley.addValidator('multiple_emails', {
       validateString: function validateString(value) {
         return /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4},*[\W]*)+$/.test(value);
       },
       messages: {
         en: 'E-Mail(s) invalid',
         es: 'Correo electrónico(s) invalidos'
       }
    });

   //    addValidator('custom', {
   //        requirementType: ['integer', 'integer'],
   //        validateString: function(value, from, to) {},
   //        priority: 22,
   //        messages: {
   //          en: "Hey, that's no good",
   //          fr: "Aye aye, pas bon du tout",
   //        }
   //    })
});
