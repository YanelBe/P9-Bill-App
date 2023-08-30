import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault();
    //On choisi l'élément input du fichier
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);

    //On récupère le fichier et son nom
    const file = fileInput.files[0];
    const fileName = file.name;

    //On définit la liste des extensions de fichiers possible à envoyer
    const validFileExtensions = ["jpg", "jpeg", "png"];

    //On sépare le nom de fichier de l'extension, pour obtenir l'extension
    const fileNameParts = fileName.split(".");
    const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();
    
    //On initialise l'état de validation de l'extension
    this.isImgFormatValid = false;

    //Si l'extension de fichier correspond à ceux acceptés, on change son état
    if (fileNameParts.length > 1 && validFileExtensions.includes(fileExtension)) {
      this.isImgFormatValid = true;
    }
    
    //Si l'extension de fichier n'est pas valide, on affiche un message d'erreur
    if (!this.isImgFormatValid) {
      fileInput.value = "";
      alert("Ce format de fichier n'est pas pris en charge.\nVeuillez choisir un fichier jpg, jpeg ou png.");
    //Sinon, si l'extension de fichier est valide, on stocke les valeurs pour les utiliser avec un submit
    } else {
      const formData = new FormData();
      const email = JSON.parse(localStorage.getItem("user")).email;
      formData.append("file", file);
      formData.append("email", email);
      this.formData = formData;
      this.fileName = fileName;
    }
  };
  
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }

    //Si le format de l'image est valide, on passe à la fonction handleSubmit
    //Sinon, le message d'erreur indiquant que le fichier n'est pas au bon format s'affiche
    if (this.isImgFormatValid) {
			this.store
				.bills()
				.create({
					data: this.formData,
					headers: {
						noContentType: true,
					},
				})

				.then(({ fileUrl, key }) => {
					console.log(fileUrl);
					this.billId = key;
					this.fileUrl = fileUrl;
				})

				.then(() => {
					this.updateBill(bill);
				})
				.catch((error) => console.error(error));
		}
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}