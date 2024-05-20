import React, { useState, useEffect } from 'react';
import { Button, Dialog, InputGroup, FormGroup, Intent, Menu, MenuItem } from '@blueprintjs/core';
import { ReasonDemoActionTypes, useReasonDemoStore, useReasonDemoDispatch } from "@/app/context/ReasoningDemoContext";

// Create a new item or update an existing item in localStorage
const saveToLocalStorage = (key: string, value: any) => {
    localStorage.setItem(`x-reason-${key}`, value);
};

// Read an item from localStorage
const readFromLocalStorage = (key: string) => {
    const item = localStorage.getItem(key);
    const parts = item?.split('@@');
    const states = parts?.[0] ? JSON.parse(parts[0]) : undefined;
    const solution = parts?.[1];
    return { states, solution };
};

// Delete an item from localStorage
const deleteFromLocalStorage = (key: string) => {
    localStorage.removeItem(key);
};

// Get all keys from localStorage with x-reason prefix
const getAllReasonKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('x-reason-')) {
            keys.push(key.replace('x-reason-', ''));
        }
    }
    return keys;
};

const LocalStorage = () => {
    const { states, solution } = useReasonDemoStore();
    const dispatch = useReasonDemoDispatch();
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [availableKeys, setAvailableKeys] = useState<string[]>([]);
    const [selectedKey, setSelectedKey] = useState<string | undefined>();

    useEffect(() => {
        setAvailableKeys(getAllReasonKeys());
    }, []);

    const handleSave = () => {
        saveToLocalStorage(name, `${JSON.stringify(states)}@@${solution}`);
        setAvailableKeys(getAllReasonKeys());
        setIsSaveDialogOpen(false);
    };

    const handleDelete = () => {
        if (selectedKey) {
            deleteFromLocalStorage(`x-reason-${selectedKey}`);
            setAvailableKeys(getAllReasonKeys());
            setIsDeleteDialogOpen(false);
        }
    };

    const handleSelectKey = (key: string) => {
        setSelectedKey(key);
    };

    const handleLoadSolution = () => {
        if (selectedKey) {
            const { states, solution } = readFromLocalStorage(`x-reason-${selectedKey}`);
            dispatch({
                type: ReasonDemoActionTypes.SET_STATE,
                value: {
                    states,
                    solution,
                    currentState: undefined,
                    context: undefined,
                    event: undefined,
                }
            });
        }
    };

    return (
        <div>
            <Button intent={Intent.PRIMARY} onClick={() => setIsSaveDialogOpen(true)}>
                Save Solution
            </Button>
            <Button intent={Intent.DANGER} onClick={() => setIsDeleteDialogOpen(true)}>
                Delete Solution
            </Button>
            <Button intent={Intent.SUCCESS} onClick={handleLoadSolution}>
                Load Selected Solution
            </Button>

            <Dialog
                isOpen={isSaveDialogOpen}
                onClose={() => setIsSaveDialogOpen(false)}
                title="Save Solution"
            >
                <div className="bp3-dialog-body">
                    <FormGroup label="Name" labelFor="name-input">
                        <InputGroup
                            id="name-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormGroup>
                </div>
                <div className="bp3-dialog-footer">
                    <Button intent={Intent.PRIMARY} onClick={handleSave}>
                        Save
                    </Button>
                    <Button onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
                </div>
            </Dialog>

            <Dialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Delete Solution"
            >
                <div className="bp3-dialog-body">
                    <p>Are you sure you want to delete the solution?</p>
                </div>
                <div className="bp3-dialog-footer">
                    <Button intent={Intent.DANGER} onClick={handleDelete}>
                        Delete
                    </Button>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                </div>
            </Dialog>

            <h3>Available Solutions</h3>
            <Menu>
                {availableKeys.map((key) => (
                    <MenuItem key={key} text={key} onClick={() => handleSelectKey(key)} />
                ))}
            </Menu>

            {selectedKey && (
                <div>
                    <h3>Selected Solution</h3>
                    <p>Key: {selectedKey}</p>
                </div>
            )}
        </div>
    );
};

export default LocalStorage;
