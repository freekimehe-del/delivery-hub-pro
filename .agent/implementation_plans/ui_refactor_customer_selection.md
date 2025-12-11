# Implementation Plan - Refactoring Customer Selection UI

## Goal
Overhaul the "Select Customer" experience in the Logistics Dashboard. Move from a basic table view to a sophisticated, modern layout with:
1.  **Searchable Dropdown/Command Interface**: Quick customer lookup.
2.  **Embedded Management**: Direct "Add New" and "Edit" capabilities within the context of selection.
3.  **Modern Aesthetic**: Blur overlays, smooth animations, and a clean professional design.

## User Review Required
> [!NOTE] 
> This is a significant UI change. The previous "Table Dialog" will be replaced by a "Command Center" style dialog.
> We are adding a new `CustomerFormDialog` component that handles both Creation and Editing.

## Proposed Changes

### [New Component] `src/components/logistics/bookings/CustomerFormDialog.tsx`
*   **Purpose**: A reusable modal for Creating and Editing customers.
*   **Props**: `open`, `onOpenChange`, `initialData` (for edit), `onSave`.
*   **Fields**: Name, Code, Contact Person, Email, Phone, Address, Tax ID, Type (Select: Importer/Exporter/Both).
*   **Logic**: Uses Supabase `upsert` to save data.

### [Refactor] `src/components/logistics/bookings/CustomerSelectionDialog.tsx`
*   **UI Change**: Switch from `<Table>` to `<Command>` (shadcn/ui).
*   **Structure**:
    *   **Header**: Title "Select Customer".
    *   **Body**: 
        *   `<CommandInput>`: "Type to search customers..."
        *   `<CommandList>`: 
            *   `<CommandEmpty>`: "No customers found. [Add New Button]"
            *   `<CommandGroup>`: List of customers as items.
                *   Item Layout: Name (Bold) | Code (Gray) | [Edit Button (Pencil)]
    *   **Footer**: "Add New Customer" button (Primary Blue).
*   **Interaction**:
    *   Clicking an item selects it and closes the dialog.
    *   Clicking "Edit" opens `CustomerFormDialog` (nested or stacked).
    *   Clicking "Add New" opens `CustomerFormDialog`.

### [Update] `src/pages/logistics/CreateBooking.tsx`
*   No major API change expected, as `CustomerSelectionDialog` keeps the same `onSelect` prop signature.
*   Verify the trigger button styles match the new "Modern" aesthetic.

## Verification
1.  **Selection**: Open dialog -> Search "Acme" -> Click -> Input updates.
2.  **Add New**: Open dialog -> Click "Add New" -> Fill Form -> Save -> List refreshes -> New customer selected.
3.  **Edit**: Open dialog -> Search -> Click Pencil -> Edit Name -> Save -> List refreshes -> Name updated.
