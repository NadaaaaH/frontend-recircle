import { forwardRef, useEffect, useRef } from "react";

export default forwardRef(function TextInput(
    { type = "text", className = "", isFocused = false, ...props },
    ref,
) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={
                // KITA HAPUS class 'dark:...' di sini agar warna konsisten
                "border-gray-400 focus:border-primary focus:ring-primary rounded-xl shadow-sm " +
                className
            }
            ref={input}
        />
    );
});
