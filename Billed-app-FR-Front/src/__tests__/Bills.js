/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom/extend-expect";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";

import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH, } from "../constants/routes.js";

import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {

  //On utilise la fonction jest beforeEach() pour exécuter du code avant chaque test, pour éviter certaines répétitions
  beforeEach(async () => {
    //On utilise la méthode defineProperty() pour notre test
    //On simule le localStorage avec localStorageMock, et on simule l'utilisateur employé
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))

    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
  })

  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId("icon-window"))
      const windowIcon = screen.getByTestId("icon-window")
      const isIconActive = windowIcon.classList.contains("active-icon");
      
      //Ajout de l'expression "expect"
      expect(isIconActive).toBeTruthy();
    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    
    test("Then bills should be formatted correctly", async () => {
      const billsClass = new Bills({
        document,
        onNavigate,
        store: {
          bills: () => mockStore.bills(),
        },
        localStorage: localStorageMock,
      });
    
      const listSpy = jest.spyOn(mockStore.bills(), 'list');
      const formattedBills = await billsClass.getBills();
      
      expect(listSpy).toHaveBeenCalled();
      expect(formattedBills).toEqual(expect.any(Array));
    });
  })
})



describe("Given I am connected as an employee", () => {

  //On utilise la fonction jest beforeEach() pour exécuter du code avant chaque test, pour éviter certaines répétitions
  beforeEach(async () => {
    //On utilise la méthode defineProperty() pour notre test
    //On simule le localStorage avec localStorageMock, et on simule l'utilisateur employé
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))

    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
  })

  describe("When I navigate to NewBill page", () => {
    //Test pour vérifier si la redirection fonctionne lorsqu'on clique sur le bouton pour créer une nouvelle note de frais
    test("Then, it should render NewBill page", async () => {
      
      //On génère le HTML de la page avec des données vides et on l'injecte dans le DOM
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      //On stocke l'état global de l'application
      const store = null;

      //On simule le changement de route car le clic est censé rediriger vers une nouvelle page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      
      //On créé une instance de la classe Bills pour simuler le comportement de l'utilisateur
      const billsClass = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      
      //La méthode jest.fn va simuler la méthode handleClickNewBill pour vérifier ensuite si elle est appelée
      const handleClickNewBill = jest.fn(billsClass.handleClickNewBill);

      //On recherche et sélectionne le bouton de création d'une nouvelle note de frais dans le DOM, et on simule le clic dessus
      const newBillButton = screen.getByTestId("btn-new-bill");
      newBillButton.addEventListener("click", handleClickNewBill);
      userEvent.click(newBillButton);

      //On vérifie maintenant que la méthode handleClickNewBill a bien été appelée
      expect(handleClickNewBill).toHaveBeenCalled();

      //On vérifie si le texte est bien présent dans le DOM, comme dans le test de routes.js
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    })
  })


  describe("When I click on the icon eye", () => {
    //Test pour vérifier si une modale s'ouvre correctement lorsqu'on clique sur une icône en forme d'oeil
      test("Then a modal should open", () => { 

        //On génère le HTML de la page avec les données de bills et on l'injecte dans le DOM
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;

        //On stocke l'état global de l'application
        const store = null;

        //On créé une instance de la classe Bills pour simuler le comportement de l'utilisateur
        const billsClass = new Bills({
          document,
          onNavigate,
          store,
          localStorageMock,
        });

        //La méthode jest.fn va simuler la méthode "modal" de jQuery pour vérifier si son comportement est correct
        $.fn.modal = jest.fn();

        //La méthode jest.fn va simuler la méthode handleClickIconEye pour vérifier ensuite si elle est appelée
        const handleClickIconEye = jest.fn(billsClass.handleClickIconEye);

        //On recherche et sélectionne les icônes d'oeil dans le DOM, et on simule le clic sur chacune de ces icones 
        const iconEye = screen.getAllByTestId("icon-eye");
        iconEye.forEach((icon) => {
          icon.addEventListener("click", () => handleClickIconEye(icon));
          userEvent.click(icon);
        });

        //On vérifie maintenant que la méthode handleClickIconEye a bien été appelée
        expect(() => handleClickIconEye()).toThrow();
        expect(() => handleClickIconEye()).toThrow(Error);
        expect(handleClickIconEye).toHaveBeenCalled();

        //On recherche l'ID de la modale censée apparaître lors du clic sur une icône d'oeil, et on confirme sa présence
        const modal = document.getElementById("modaleFile");
        expect(modal).toBeTruthy();
        })
    })
})


//Test d'intégration GET
describe("Given I am a user connected as Employee", () => {

  beforeEach(async () => {
    //On clear toutes les simulations/espionnages fait précédemment
    jest.clearAllMocks(); 

    //On utilise la méthode defineProperty() pour notre test
    //On simule le localStorage avec localStorageMock, et on simule l'utilisateur employé
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))

    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()

  })

  describe("When I navigate to Bills", () => {
    
    test("Then it should fetch the bills from mock API GET", async () => {
      //On espionne le store mock, on attend d'obtenir son contenu, puis on vérifie si la fonction a été appelée une fois, et si sa taille correspond à celle présente dans le mock
      const listSpy = jest.spyOn(mockStore.bills(), "list");
      const bills = await mockStore.bills().list();
      expect(listSpy).toHaveBeenCalledTimes(1);
      expect(bills.length).toBe(4);
    });

    describe("When an error occurs on API", () => {

      test("Then it should fetch the bills from API and fails with 404 message error", async () => {
        const listSpy = jest.spyOn(mockStore.bills(), "list");
        //On utilise la méthode mockImplementationOnce pour simuler une appel à une fonction simulée
        listSpy.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
  
        //On initialise le body avec BillsUI
        document.body.innerHTML = BillsUI({ error: "Erreur 404" });
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
  
      test("Then it should fetch the messages from API and fails with 500 message error", async () => {
        const listSpy = jest.spyOn(mockStore.bills(), "list");
        listSpy.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
  
        document.body.innerHTML = BillsUI({ error: "Erreur 500" });
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });


    })
    
  });
});