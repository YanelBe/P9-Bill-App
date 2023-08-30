import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'

const row = (bill) => {
  //On utilise une variable conditionnelle pour pouvoir utiliser les dates non formatées pour le tri des dates
  //En retour, ce sont bien les dates formatées qui seront affichées sur l'application
  const dateBill = bill.formatedDate ?? bill.date;
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${dateBill}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
  }

//Modification pour le tri correct des dates
const rows = (data) => {
  //On trie le tableau data, en ordre décroissant (du plus récent au plus ancien) et on stocke le résultat dans une variable
  const sortedDataByDate =
    //Ternaire : si le tableau n'est pas vide, on active la suite
    data && data.length > 0
      //La méthode sort compare une date a avec une date b
      ? data.sort((a, b) => new Date(b.date) - new Date(a.date))
      : "";

  return data && data.length
    //On vérifie de nouveau si le tableau est vide, puis on utilise la méthode map() pour appliquer la fonction à chaque bill
    //Puis on utilise la méthode join() pour combiner les lignes générées par la fonction row
    ? sortedDataByDate.map((bill) => row(bill)).join("")
    : "";
    
};



export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}