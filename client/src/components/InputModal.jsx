import React, { useState, useEffect, useRef } from 'react';
import './InputModal.css';

const InputModal = ({ isOpen, message, onSubmit }) => {
    const [value, setValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setValue('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(value);
    };

    return (
        <div className="input-modal-overlay">
            <div className="input-modal-content">
                <h3>Input Required</h3>
                <p>{message || "Python script requires input:"}</p>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="input-modal-field"
                        placeholder="Type your input here..."
                    />
                    <button type="submit" className="input-modal-submit">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InputModal;
