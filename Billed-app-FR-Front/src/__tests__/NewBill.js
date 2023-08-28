/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

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


	describe("When I am on NewBill Page", () => {
		test("Then new bill icon in vertical layout should be highlighted", async () => {
			router();
			window.onNavigate(ROUTES_PATH.NewBill);
			await waitFor(() => screen.getByTestId("icon-mail"));
			const windowIcon = screen.getByTestId("icon-mail");
			const isIconActive = windowIcon.classList.contains("active-icon");
      		expect(isIconActive).toBeTruthy();
		})

		//On vérifie si chaque input est présent (et vide), et que les placeholders sont bien là
		test("Then new bill page should be rendered correctly", async () => {

			const expenseName = screen.getByTestId("expense-name");
			expect(expenseName.getAttribute("placeholder")).toBe("Vol Paris Londres");
			expect(expenseName.value).toBe("");

			const date = screen.getByTestId("datepicker");
			expect(date.value).toBe("");

			const amount = screen.getByTestId("amount");
			expect(amount.getAttribute("placeholder")).toBe("348");
			expect(amount.value).toBe("");

			const inputVat = screen.getByTestId("vat");
			expect(inputVat.getAttribute("placeholder")).toBe("70");
			expect(inputVat.value).toBe("");

			const pct = screen.getByTestId("pct");
			expect(pct.getAttribute("placeholder")).toBe("20");
			expect(pct.value).toBe("");

			const comment = screen.getByTestId("commentary");
			expect(comment.value).toBe("");

			const file = screen.getByTestId("file");
			expect(file.value).toBe("");

			const form = screen.getByTestId("form-new-bill");
			userEvent.click(form);
			expect(screen.getByTestId("form-new-bill")).toBeTruthy();
		})


		describe("When I select a file", () => {

			//On créé une variable contenant le type d'extensions correct
			const validFileExtensions = [
				["png", "image/png"],
				["jpg", "image/jpeg"],
				["jpeg", "image/jpeg"]
			  ];

			//On teste chaque type d'extension avec test.each et on l'upload si c'est correct
			test.each(validFileExtensions)("Then the file should be uploaded if the file extension is correct", async (extension, mimeType) => {
				
				document.body.innerHTML = NewBillUI();
			
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				
				//On stocke l'état global de l'application
				const store = null;

				const newBill = new NewBill({
					document,
					onNavigate,
					store,
					localStorage,
				});

				const handleChangeFile = jest.fn();
    			const fileInput = screen.getByTestId("file");

				window.alert = jest.fn();

				fileInput.addEventListener("change", handleChangeFile);
				fireEvent.change(fileInput, {
					target: {
					  files: [new File([`file.${extension}`], `file.${extension}`, { type: mimeType })],
					},
				  });

				expect(window.alert).not.toHaveBeenCalled();
				expect(handleChangeFile).toHaveBeenCalled();
				expect(fileInput.files[0].name).toBe(`file.${extension}`);
				expect(newBill.fileName).toBe(`file.${extension}`);
				expect(newBill.isImgFormatValid).toBe(true);
				expect(newBill.formData).not.toBe(null);
			})

			//On bloque l'upload si le fichier n'est pas correct
			test("Then the file should fail to upload and show an alert if the format is not correct", async () => {

				document.body.innerHTML = NewBillUI();

				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};

				//On stocke l'état global de l'application
				const store = null;

				const newBill = new NewBill({
					document,
					onNavigate,
					store,
					localStorage,
				});

				const handleChangeFile = jest.fn(newBill.handleChangeFile);
				const fileInput = screen.getByTestId("file");

				window.alert = jest.fn();

				fileInput.addEventListener("change", handleChangeFile);
				fireEvent.change(fileInput, {
					target: {
						files: [new File(["file.txt"], "file.txt", { type: "text/plain" })],
					},
				});
				

				expect(window.alert).toHaveBeenCalled();
				expect(handleChangeFile).toHaveBeenCalled();
				expect(newBill.fileName).toBe(null);
				expect(newBill.isImgFormatValid).toBe(false);
				expect(newBill.formData).toBe(undefined);
			})
		})

		describe("When the user click on the submit button to create a new bill", () => { 
			test("Then the form should be checked to see if it's valid", () => {

				document.body.innerHTML = NewBillUI();
			
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				
				const store = {
					bills: jest.fn(() => newBill.store),
					create: jest.fn(() => Promise.resolve({})),
				};
			
				//Création d'une instance de NewBill avec les mocks
				const newBill = new NewBill({
					document,
					onNavigate,
					store,
					localStorage,
				});
			
				//On simule la validation du format de l'image
				newBill.isImgFormatValid = true;
			
				//On simule le formulaire et la soumission
				const formNewBill = screen.getByTestId("form-new-bill");
				const handleSubmit = jest.fn(newBill.handleSubmit);
				formNewBill.addEventListener("submit", handleSubmit);
				fireEvent.submit(formNewBill);

				expect(handleSubmit).toHaveBeenCalled();

			})

		})

	})
})


//Test d'intégration POST
describe("Given I am connected as an employee", () => {

	describe("When I am on NewBill Page", () => {

		describe("When I complete the requested fields and I submit", () => {

			test("Then it should send a new bill to mock API POST", async () => {

				//On espionne mockStore.bills pour voir lorsqu'elle est appelée
				const mockStoreSpy = jest.spyOn(mockStore, "bills");

				//On utilise un mock d'une facture présente dans le fichier mock store.js
				const bill = {
					id: "47qAXb6fIm2zOKkLzMro",
					vat: "80",
					fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
					status: "pending",
					type: "Hôtel et logement",
					commentary: "séminaire billed",
					name: "encore",
					fileName: "preview-facture-free-201801-pdf-1.jpg",
					date: "2004-04-04",
					amount: 400,
					commentAdmin: "ok",
					email: "a@a",
					pct: 20,
				};

				//On attend la réception de la facture mock, on vérifie si mockStore.bills a bien été appelé
				//Et on vérifie si le contenu de la facture est identique
				const postBills = await mockStore.bills().update(bill);
				expect(mockStoreSpy).toHaveBeenCalledTimes(1);
				expect(postBills).toEqual(bill);

			})

			describe("When an error occurs on API", () => {

				beforeEach(() => {
					window.localStorage.setItem('user', JSON.stringify({
						type: 'Employee'
					  }))
					document.body.innerHTML = NewBillUI();
				});

				test("Then it should send a new bill to mock API POST and fail with 404 message error", async () => {
					//On espionne la méthode console.error pour voir lorsqu'elle est appelée
					const consoleErrorSpy = jest.spyOn(console, "error");

					//On simule le store d'API pour définir les factures, la création de facture, et l'update de la liste de factures
					//On rajoute un rejet de la promesse avec une erreur 404
					const store = {
						bills: jest.fn(() => newBill.store),
						create: jest.fn(() => Promise.resolve({})),
						update: jest.fn(() => Promise.reject(new Error("404"))),
					};

					//On créé une nouvelle instance de NewBill
					const newBill = new NewBill({
						document,
						onNavigate,
						store,
						localStorage,
					});

					//On définit la validation du format de l'image de la facture
					newBill.isImgFormatValid = true;

					//On sélectionne l'élement du DOM correspondant
					const form = screen.getByTestId("form-new-bill");
					
					//On espionne la fonction handleSubmit et on ajoute un event listener
					const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
					form.addEventListener("submit", handleSubmit);

					//On utilise fireEvent pour simuler l'envoi du formulaire, et on attend la résolution de la promesse
					fireEvent.submit(form);
					await new Promise(process.nextTick);

					//On vérifie si l'erreur 404 est bien appelée
					expect(consoleErrorSpy).toBeCalledWith(new Error("404"));

				})

				test("Then it should send a new bill to mock API POST and fail with 500 message error", async () => {
					const consoleErrorSpy = jest.spyOn(console, "error");
					const store = {
						bills: jest.fn(() => newBill.store),
						create: jest.fn(() => Promise.resolve({})),
						update: jest.fn(() => Promise.reject(new Error("500"))),
					};

					const newBill = new NewBill({
						document,
						onNavigate,
						store,
						localStorage,
					});
	
					newBill.isImgFormatValid = true;

					const form = screen.getByTestId("form-new-bill");
					const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
					form.addEventListener("submit", handleSubmit);

					fireEvent.submit(form);
					await new Promise(process.nextTick);

					expect(consoleErrorSpy).toBeCalledWith(new Error("500"));
				})
			})
		})
	})
})