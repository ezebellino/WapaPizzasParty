import React, { useContext, useEffect } from 'react';
import { AppContext } from '../store/AppContext';
import Swal from 'sweetalert2';

const Cart = () => {
    const { store, actions } = useContext(AppContext);

    const total = store.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        store.includeShipping ? 1000 : 0
    );

    const handleConfirmSale = async () => {
        const confirmed = await Swal.fire({
            title: "Confirmar venta",
            text: "¿Desea confirmar esta venta?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, confirmar",
            cancelButtonText: "Cancelar",
        });

        if (confirmed.isConfirmed) {
            const success = await actions.confirmarVenta();
            if (success) {
                Swal.fire("¡Venta confirmada!", "La venta ha sido registrada.", "success");
            } else {
                Swal.fire("Error", "No se pudo registrar la venta.", "error");
            }
        }
    };

    useEffect(() => {
        console.log("Carrito actualizado:", store.cart);
    }, [store.cart]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">Carrito</h1>
            <ul className="space-y-4">
                {store.cart.length > 0 ? (
                    store.cart.map((item) => (
                        <li key={item.id} className="flex justify-between items-center mb-2 border-b pb-2">
                            <div>
                                <p className="font-bold">{item.name}</p>
                                <label>
                                    Cantidad:
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => actions.updateCartQuantity(item.id, e.target.value)}
                                        className="border rounded p-2 ml-2 w-20 text-white bg-black text-center"
                                    />
                                </label>
                            </div>
                            <span>${item.price * item.quantity}</span>
                            <button
                                className="bg-red-500 text-white px-2 py-1 rounded text-center"
                                onClick={() => actions.removeToCart(item.id)}
                            >
                                Eliminar
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="text-center text-gray-500">El carrito está vacío.</p>
                )}
            </ul>
            <div className="mt-4">
                <label>
                    <input
                        type="checkbox"
                        checked={store.includeShipping}
                        onChange={actions.toggleShipping}
                        className="mr-2"
                    />
                    Incluir envío (+$1000)
                </label>
                <div className="mt-4 font-bold">Total: ${total}</div>
            </div>
            <button
                className="bg-green-400 text-white px-4 py-2 rounded mt-4"
                onClick={handleConfirmSale}
            >
                Confirmar Venta
            </button>
        </div>
    );
};

export default Cart;
