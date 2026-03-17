import React, { useContext, useEffect } from 'react';
import Swal from 'sweetalert2';
import { AppContext } from '../store/AppContext';

const Cart = () => {
    const { store, actions } = useContext(AppContext);

    const total = store.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        store.includeShipping ? 1000 : 0
    );

    const handleConfirmSale = async () => {
        if (store.cart.length === 0) {
            Swal.fire('Carrito vacio', 'Agrega al menos una pizza antes de confirmar la venta.', 'info');
            return;
        }

        const confirmed = await Swal.fire({
            title: 'Confirmar venta',
            text: 'Desea confirmar esta venta?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Si, confirmar',
            cancelButtonText: 'Cancelar',
        });

        if (confirmed.isConfirmed) {
            const success = await actions.confirmarVenta();
            if (success) {
                Swal.fire('Venta confirmada', 'La venta ha sido registrada.', 'success');
            } else {
                Swal.fire('Error', store.appError ?? 'No se pudo registrar la venta.', 'error');
            }
        }
    };

    useEffect(() => {
        console.log('Carrito actualizado:', store.cart);
    }, [store.cart]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-4 text-center text-2xl font-bold">Carrito</h1>
            <ul className="space-y-4">
                {store.cart.length > 0 ? (
                    store.cart.map((item) => (
                        <li key={item.id} className="mb-2 flex items-center justify-between border-b pb-2">
                            <div>
                                <p className="font-bold">{item.name}</p>
                                <label>
                                    Cantidad:
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => actions.updateCartQuantity(item.id, e.target.value)}
                                        className="ml-2 w-20 rounded border bg-black p-2 text-center text-white"
                                    />
                                </label>
                            </div>
                            <span>${item.price * item.quantity}</span>
                            <button
                                className="rounded bg-red-500 px-2 py-1 text-center text-white"
                                onClick={() => actions.removeToCart(item.id)}
                            >
                                Eliminar
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="text-center text-gray-500">El carrito esta vacio.</p>
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
                    Incluir envio (+$1000)
                </label>
                <div className="mt-4 font-bold">Total: ${total}</div>
            </div>
            <button className="mt-4 rounded bg-green-400 px-4 py-2 text-white" onClick={handleConfirmSale}>
                Confirmar venta
            </button>
        </div>
    );
};

export default Cart;
