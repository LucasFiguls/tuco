import { expect, test, type Page } from "@playwright/test";

// Checkout con "Recordar mis datos" (lib/datos-cliente.ts). Requiere la línea al vacío activa
// (flag modo_vacio). Crea pedidos de prueba con prefijo "QA Playwright" en la base.

const KEY = "tuco_datos_cliente";
const DATOS = {
  nombre: "QA Playwright E2E",
  telefono: "1100000000",
  direccion: "Calle Falsa 123",
};

async function armarCaja(page: Page) {
  await page.goto("/armar?caja=5");
  await page.getByRole("button", { name: "Llenala por mí" }).click();
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Tus datos" })).toBeVisible();
}

function campos(page: Page) {
  const form = page.locator("form");
  return {
    nombre: form.getByText("Nombre y apellido").locator("..").getByRole("textbox"),
    telefono: form.getByPlaceholder("Ej: 1157571366"),
    direccion: form.getByPlaceholder("Calle 123, Piso 2, Depto B"),
    comentarios: form.getByPlaceholder("Alergias, aclaraciones, etc."),
    recordar: form.getByRole("checkbox", { name: /Recordar mis datos/ }),
    delivery: form.getByRole("button", { name: /Envío a domicilio|Delivery/ }),
    borrar: form.getByRole("button", { name: "¿No sos vos? Borrar" }),
    enviar: form.getByRole("button", { name: "Enviar pedido" }),
  };
}

const leerGuardados = (page: Page) => page.evaluate((k) => localStorage.getItem(k), KEY);

test.describe("checkout: recordar datos", () => {
  test("guarda solo los datos de contacto, los precarga y se pueden borrar", async ({ page }) => {
    await armarCaja(page);
    const c = campos(page);

    await expect(c.recordar).toBeChecked();
    expect(await leerGuardados(page)).toBeNull();

    await c.nombre.fill(DATOS.nombre);
    await c.telefono.fill(DATOS.telefono);
    await c.delivery.click();
    await c.direccion.fill(DATOS.direccion);
    await c.comentarios.fill("QA: no debe guardarse");
    await c.enviar.click();

    await expect(page).toHaveURL(/\/confirmacion\?numero=\d+/);
    expect(JSON.parse((await leerGuardados(page))!)).toEqual({
      v: 1,
      cliente_nombre: DATOS.nombre,
      cliente_telefono: DATOS.telefono,
      modalidad: "DELIVERY",
      direccion_entrega: DATOS.direccion,
    });

    // Segundo pedido: viene todo precargado menos los comentarios
    await armarCaja(page);
    await expect(page.getByText("Usamos los datos que guardaste.")).toBeVisible();
    await expect(c.nombre).toHaveValue(DATOS.nombre);
    await expect(c.telefono).toHaveValue(DATOS.telefono);
    await expect(c.direccion).toHaveValue(DATOS.direccion);
    await expect(c.comentarios).toHaveValue("");
    await expect(c.recordar).toBeChecked();

    await c.borrar.click();
    await expect(c.nombre).toHaveValue("");
    await expect(c.telefono).toHaveValue("");
    await expect(c.direccion).toBeHidden(); // vuelve a retiro
    await expect(c.recordar).not.toBeChecked();
    await expect(page.getByText("Usamos los datos que guardaste.")).toBeHidden();
    expect(await leerGuardados(page)).toBeNull();
  });

  test("un pedido sin tildar 'Recordar' borra los datos guardados", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(
      ([k, nombre, telefono]) =>
        localStorage.setItem(k, JSON.stringify({ v: 1, cliente_nombre: nombre, cliente_telefono: telefono, modalidad: "RETIRO", direccion_entrega: "" })),
      [KEY, `${DATOS.nombre} sin recordar`, DATOS.telefono]
    );

    await armarCaja(page);
    const c = campos(page);
    await expect(c.recordar).toBeChecked();
    await c.recordar.uncheck();
    await c.enviar.click();

    await expect(page).toHaveURL(/\/confirmacion\?numero=\d+/);
    expect(await leerGuardados(page)).toBeNull();
  });

  test("ignora datos guardados corruptos", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((k) => localStorage.setItem(k, "{no es json"), KEY);

    await armarCaja(page);
    const c = campos(page);
    await expect(c.nombre).toHaveValue("");
    await expect(c.recordar).toBeChecked();
    await expect(page.getByText("Usamos los datos que guardaste.")).toBeHidden();
  });
});
