import { fireEvent, render } from "@testing-library/react";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { ConnectionNote } from "./ConnectionNote";

describe("Connection Note", () => {
  test("Render connection note", async () => {
    const handleUpdate = jest.fn();
    const handleDelete = jest.fn();

    const { getByTestId } = render(
      <ConnectionNote
        data={{
          id: "1",
          title: "note 1",
          message: "note 2",
        }}
        onDeleteNote={handleDelete}
        onNoteDataChange={handleUpdate}
      />
    );

    await waitForIonicReact();

    const titleInput = getByTestId("edit-connections-modal-note-title-1");
    const messageInput = getByTestId("edit-connections-modal-note-message-1");

    expect(titleInput.querySelector("input")?.value).toBe("note 1");
    expect(messageInput.querySelector("textarea")?.value).toBe("note 2");
  });

  test("Fire delete action when click delete", async () => {
    const handleUpdate = jest.fn();
    const handleDelete = jest.fn();

    const { getByTestId } = render(
      <ConnectionNote
        data={{
          id: "1",
          title: "note 1",
          message: "note 2",
        }}
        onDeleteNote={handleDelete}
        onNoteDataChange={handleUpdate}
      />
    );

    await waitForIonicReact();

    const deleteButton = getByTestId("note-delete-button-1");

    fireEvent.click(deleteButton);

    expect(handleDelete).toBeCalledTimes(1);
  });
});
