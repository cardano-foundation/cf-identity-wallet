import { waitForIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { ConnectionNote } from "./ConnectionNote";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonInput: (props: any) => {
    return (
      <input
        {...props}
        data-testid={props["data-testid"]}
        onBlur={(e) => props.onIonBlur(e)}
        onFocus={(e) => props.onIonFocus(e)}
        onChange={(e) => props.onIonInput?.(e)}
      />
    );
  },
  IonTextarea: (props: any) => {
    return (
      <textarea
        {...props}
        data-testid={props["data-testid"]}
        onBlur={(e) => props.onIonBlur(e)}
        onFocus={(e) => props.onIonFocus(e)}
        onChange={(e) => props.onIonInput?.(e)}
      />
    );
  },
}));

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

    expect((titleInput as HTMLInputElement).value).toBe("note 1");
    expect((messageInput as HTMLTextAreaElement).value).toBe("note 2");
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

  test("Submit note when blur", async () => {
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

    const noteInput = getByTestId("edit-connections-modal-note-title-1");

    act(() => {
      fireEvent.change(noteInput, {
        target: { value: "new Value" },
      });
    });

    await waitFor(() => {
      expect((noteInput as HTMLInputElement).value).toEqual("new Value");
    });

    fireEvent.blur(noteInput);

    expect(handleUpdate).toBeCalled();

    const noteMessageInput = getByTestId(
      "edit-connections-modal-note-message-1"
    );

    act(() => {
      fireEvent.change(noteMessageInput, {
        target: { value: "new Value" },
      });
    });

    await waitFor(() => {
      expect((noteMessageInput as HTMLInputElement).value).toEqual("new Value");
    });
  });
});
