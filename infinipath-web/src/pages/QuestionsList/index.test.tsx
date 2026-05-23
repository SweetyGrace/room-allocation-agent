
import {
  render,
  screen,
  fireEvent,
  waitFor,
  getAllByRole,
} from "@testing-library/react";
import "@testing-library/jest-dom"; // Add this import
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { createStore } from "redux";
import QuestionsList from "./index";
import * as apiService from "../../services/apiService";
import { questionStatus } from "../../constants";

// Mock API service
jest.mock("../../services/apiService");
jest.mock("../../services/localStorage", () => ({
  getItemInLocalStorage: jest.fn().mockReturnValue({ id: "123" }),
}));

const mockStore = createStore((state = {}) => state);

const renderWithProviders = () => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <QuestionsList />
      </BrowserRouter>
    </Provider>,
  );
};

describe("QuestionsList", () => {
  beforeEach(() => {
    // Setup default API responses
    (apiService.getCall as jest.Mock).mockResolvedValue({
      data: {
        statusCode: 200,
        data: {
          data: [
            {
              id: 1,
              name: "Test Question",
              label: "Test Question",
              type: "MCQ",
              status: questionStatus.draft,
              options: ["Option 1", "Option 2"],
            },
            {
              id: 3,
              name: "Test Question1",
              label: "Test Question1",
              type: "MCQ",
              status: questionStatus.published,
              options: ["Option 1", "Option 2"],
            },
          ],
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  //passed
  describe("Initial Rendering", () => {
    test("renders loading state initially", () => {
      renderWithProviders();
      expect(
        screen.getByTestId("loader-animation-container"),
      ).toBeInTheDocument();
    });

    test("renders questions after loading", async () => {
      renderWithProviders();
      expect(
        screen.getByTestId("loader-animation-container"),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(
          screen.queryByTestId("loader-animation-container"),
        ).not.toBeInTheDocument();
        jest.clearAllMocks();
        expect(screen.getByText("Test Question")).toBeInTheDocument();
      });
    });

   
  });
  //passed
  describe("Tab Navigation", () => {
    test("switches between draft and published tabs", async () => {
      renderWithProviders();
      expect(
        screen.getByTestId("loader-animation-container"),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(
          screen.queryByTestId("loader-animation-container"),
        ).not.toBeInTheDocument();
      });
      const publishedTab = screen.getAllByRole("tab");
      fireEvent.click(publishedTab[1]);
      expect(screen.getAllByRole("tab")[1].getAttribute("aria-selected")).toBe(
        "true",
      );
      const draftTab = screen.getAllByRole("tab");
      fireEvent.click(draftTab[0]);
      expect(screen.getAllByRole("tab")[0].getAttribute("aria-selected")).toBe(
        "true",
      );


    });
  });

  describe("Question Management", () => {
    beforeEach(() => {
      // Setup default API responses
      (apiService.getCall as jest.Mock).mockResolvedValue({
        data: {
          statusCode: 200,
          data: {
            data: [
              {
                id: 1,
                name: "Test Question",
                label: "Test Question",
                type: "MCQ",
                status: questionStatus.draft,
                options: ["Option 1", "Option 2"],
              },
              {
                id: 3,
                name: "Test Question1",
                label: "Test Question1",
                type: "MCQ",
                status: questionStatus.published,
                options: ["Option 1", "Option 2"],
              },
            ],
          },
        },
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    //passed
    test("opens add question modal", async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("add-question-button"));
      expect(screen.getByRole("presentation")).toBeInTheDocument();
    });
    //passed
    test("handles question deletion", async () => {
      (apiService.deleteCall as jest.Mock).mockResolvedValueOnce({
        data: { statusCode: 200 },
      });

      renderWithProviders();
      expect(
        screen.getByTestId("loader-animation-container"),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(
          screen.queryByTestId("loader-animation-container"),
        ).not.toBeInTheDocument();
      });
      const menuButton = await screen.findByRole("button", { name: /more/i });
      fireEvent.click(menuButton);

      const deleteMenuItem = await screen.findByText(/delete/i);

      // Step 3: Assert both items are in the document
      expect(deleteMenuItem).toBeInTheDocument();

      fireEvent.click(deleteMenuItem);

      expect(apiService.deleteCall).toHaveBeenCalled();
    });

    //pass
    test("handles question edit", async () => {
      (apiService.putCall as jest.Mock).mockResolvedValueOnce({
        data: { statusCode: 200 },
      });

      renderWithProviders();

      // Wait for loader to disappear
      expect(
        screen.getAllByTestId("loader-animation-container")[0],
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(
          screen.queryByTestId("loader-animation-container"),
        ).not.toBeInTheDocument();
      });

      const menuButton = await screen.findByRole("button", { name: /more/i });
      fireEvent.click(menuButton);

      const editMenuItem = await screen.findByText(/edit/i);
      expect(editMenuItem).toBeInTheDocument();
      fireEvent.click(editMenuItem);

      // Assuming a modal or drawer now appears with a form
      const input = await screen.findByTestId("question-input"); // <-- adjust this selector
      fireEvent.change(input, { target: { value: "Updated question text" } });

      const saveButton = screen.getByTestId("submit-button"); // <-- adjust if it's "Update"
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(apiService.putCall).toHaveBeenCalled();
      });
      // });
    });
    //passed
    test("publishes draft question", async () => {
      renderWithProviders();
      expect(
        screen.getByTestId("loader-animation-container"),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(
          screen.queryByTestId("loader-animation-container"),
        ).not.toBeInTheDocument();
      });
      (apiService.putCall as jest.Mock).mockResolvedValueOnce({
        data: { statusCode: 200 },
      });

      fireEvent.click(await screen.findByTestId("publish-button"));
      expect(apiService.putCall).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          status: questionStatus.published,
        }),
      );
    });
    //passed
    test("duplicates published question", async () => {
      renderWithProviders();
      expect(
        screen.getByTestId("loader-animation-container"),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(
          screen.queryByTestId("loader-animation-container"),
        ).not.toBeInTheDocument();
      });
      
      const published = screen.getAllByRole("tab");
      fireEvent.click(published[1]);
      // Find the menu button first
      const menuButton = await screen.findByLabelText("more");
      fireEvent.click(menuButton);

      // Then find and click the duplicate option
      const duplicateOption = await screen.findByRole("menuitem");
      fireEvent.click(duplicateOption);

      // Verify the dialog appears
      await waitFor(() => {
        expect(screen.getByRole("presentation")).toBeInTheDocument();
      });
    });
  });

  describe("Question Details", () => {
    beforeEach(() => {
      // Setup default API responses
      (apiService.getCall as jest.Mock).mockResolvedValue({
        data: {
          statusCode: 200,
          data: {
            data: [
              {
                id: 1,
                name: "Test Question",
                label: "Test Question",
                type: "MCQ",
                status: questionStatus.draft,
                options: ["Option 1", "Option 2"],
              },
            ],
          },
        },
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    test("opens question detail modal on row click", async () => {
      // renderWithProviders();
      renderWithProviders();
      expect(screen.getAllByTestId("loading-state")[1]).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
      });
      const menuButton = await screen.findByRole("row");
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByTestId("question-details")).toBeInTheDocument();
      });
    });

    //Passed
    test("displays correct question count", async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByText("(1 Questions)")).toBeInTheDocument();
      });
    });
  });

  //Passed
  describe("Empty States", () => {
    test("handles empty questions list", async () => {
      (apiService.getCall as jest.Mock).mockResolvedValueOnce({
        data: {
          statusCode: 200,
          data: { data: [] },
        },
      });

      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByText("No draft questions!")).toBeInTheDocument();
      });
    });
  });

  //Passed
  describe("Form Operations", () => {
    test("handles form submission", async () => {
      (apiService.postCall as jest.Mock).mockResolvedValueOnce({
        data: {
          statusCode: 201,
          data: {
            id: 2,
            name: "New Question",
          },
        },
      });

      renderWithProviders();
      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("add-question-button"));
      // Add more form submission tests based on your form structure
    });
  });
});

describe("Error Handling", () => {
  test("displays error message when API fails", async () => {
    (apiService.getCall as jest.Mock).mockRejectedValueOnce(
      new Error("API Error"),
    );
    renderWithProviders();

    expect(
      screen.getByTestId("loader-animation-container"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByTestId("loader-animation-container"),
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });
  });
});


describe.only("NegativeTestCases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default API responses
    (apiService.getCall as jest.Mock).mockResolvedValue({
      data: {
        statusCode: 200,
        data: {
          data: [
            {
              id: 1,
              name: "Test Question",
              label: "Test Question",
              type: "MCQ",
              status: questionStatus.draft,
              options: ["Option 1", "Option 2"],
            },
          ],
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("handles question deletion failure", async () => {


    (apiService.deleteCall as jest.Mock).mockRejectedValueOnce(
      new Error("Delete failed"),
    );

    renderWithProviders();
    expect(
      screen.getByTestId("loader-animation-container"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByTestId("loader-animation-container"),
      ).not.toBeInTheDocument();
    });

    const menuButton = await screen.findByRole("button", { name: /more/i });
    fireEvent.click(menuButton);

    const deleteMenuItem = await screen.findByText(/delete/i);
    fireEvent.click(deleteMenuItem);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });
  });
});
