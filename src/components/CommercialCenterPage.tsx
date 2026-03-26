// Here is the updated code for CommercialCenterPage.tsx
import React from 'react';
import Modal from 'your-modal-library';

const CommercialCenterPage = () => {
  const [isModalOpen, setModalOpen] = React.useState(false);

  const handleClose = () => setModalOpen(false);

  return (
    <div>
      <button onClick={() => setModalOpen(true)}>Open Modal</button>
      <Modal isOpen={isModalOpen} onRequestClose={handleClose} className="modal-container">
        <div className="backdrop-overlay"></div>
        <div className="modal-content">
          <h1>Modal Title</h1>
          <p>Modal Body</p>
          <button onClick={handleClose}>Close Modal</button>
        </div>
      </Modal>
    </div>
  );
};

export default CommercialCenterPage;
