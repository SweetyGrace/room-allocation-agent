import { getCall, postCall } from "./apiService";
import { endPoints, PORTAL } from "../constants/urlConstants";
import {Option } from "../types/question";

export const questionService = {
  /**
   * Fetch options based on category
   */
  async fetchOptions(categoryId?: string): Promise<Option[]> {
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: "0",
        searchText: "",
        ...(categoryId && { categoryId: JSON.stringify([categoryId]) }),
      });

      const response = await getCall(
        `${endPoints.option}?${params.toString()}`,
        undefined,
        PORTAL
      );
      if (response?.data?.statusCode === 200) {
        return response.data.data.data;
      }
      throw new Error("Failed to fetch options");
    } catch (error) {
      console.error("Error fetching options:", error);
      throw error;
    }
  },

  /**
   * Create new category
   */
  async createCategory(name: string, userId: string): Promise<string> {
    const payload = {
      name,
      createdBy: userId,
      updatedBy: userId,
    };

    const response = await postCall(endPoints.category, payload, PORTAL);
    if (response?.data?.statusCode === 201) {
      return response.data.data.id;
    }
    throw new Error("Failed to create category");
  },

  /**
   * Create new option
   */
  async createOption(data: {
    name: string;
    type: string;
    categoryId: string | null;
    userId: string;
  }): Promise<number> {
    const payload = {
      name: data.name,
      type: data.type,
      categoryId: data.categoryId,
      createdBy: data.userId,
      updatedBy: data.userId,
    };

    const response = await postCall(endPoints.option, payload, PORTAL);
    if (response?.data?.statusCode === 201) {
      return parseInt(response.data.data.id);
    }
    throw new Error("Failed to create option");
  },

  /**
   * Create question-option association
   */
  async createQuestionOptionAssociation(data: {
    questionId: number;
    optionIds: number[];
    userId: string;
  }): Promise<void> {
    const payload = {
      questionId: data.questionId,
      optionIds: data.optionIds,
      createdBy: data.userId,
      updatedBy: data.userId,
    };

    const response = await postCall(endPoints.questionOption, payload, PORTAL);
    if (response?.data?.statusCode !== 201) {
      throw new Error("Failed to create question-option association");
    }
  },

  /**
   * Fetch options by categories for specific option index
   */
  async fetchOptionsByCategory(categories: string[] | null): Promise<Option[]> {
    const params = new URLSearchParams({
      limit: "50",
      offset: "0",
      searchText: "",
      ...(categories?.length && { categoryId: JSON.stringify(categories) }),
    });

    const response = await getCall(`${endPoints.option}?${params.toString()}`, undefined, PORTAL);
    if (response?.data?.statusCode === 200) {
      return response.data.data.data;
    }
    throw new Error("Failed to fetch options by category");
  },
};
