
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';


export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'dropdown' | 'checkbox' | 'textarea';
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

interface AddFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: CustomField, applyToSubPrograms?: boolean) => void;
  isSubProgram?: boolean;
}

export const AddFieldDialog = ({ isOpen, onClose, onSave, isSubProgram = false }: AddFieldDialogProps) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<CustomField['type']>('text');
  const [required, setRequired] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');
  const [options, setOptions] = useState('');
  const [applyToSubPrograms, setApplyToSubPrograms] = useState(false);

  const handleSave = () => {
    const field: CustomField = {
      id: Date.now().toString(),
      label,
      type,
      required,
      defaultValue: defaultValue || undefined,
      options: type === 'dropdown' ? options.split(',').map(o => o.trim()).filter(Boolean) : undefined,
    };

    onSave(field, !isSubProgram ? applyToSubPrograms : undefined);
    
    // Reset form
    setLabel('');
    setType('text');
    setRequired(false);
    setDefaultValue('');
    setOptions('');
    setApplyToSubPrograms(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="field-label">Field Label</Label>
            <Input
              id="field-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter field label"
            />
          </div>

          <div>
            <Label htmlFor="field-type">Field Type</Label>
            <Select value={type} onValueChange={(value: CustomField['type']) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Input</SelectItem>
                <SelectItem value="number">Number Input</SelectItem>
                <SelectItem value="textarea">Text Area</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'dropdown' && (
            <div>
              <Label htmlFor="field-options">Options (comma-separated)</Label>
              <Input
                id="field-options"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}

          <div>
            <Label htmlFor="default-value">Default Value (optional)</Label>
            <Input
              id="default-value"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Enter default value"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={required}
              onCheckedChange={(checked) => setRequired(checked as boolean)}
            />
            <Label htmlFor="required">Required field</Label>
          </div>

          {!isSubProgram && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="apply-to-subprograms"
                checked={applyToSubPrograms}
                onCheckedChange={(checked) => setApplyToSubPrograms(checked as boolean)}
              />
              <Label htmlFor="apply-to-subprograms">Apply this field to all sub-programs</Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!label.trim()}>Add Field</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
