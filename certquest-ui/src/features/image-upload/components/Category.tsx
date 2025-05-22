interface CategoryProps {
  category: string;
  setCategory: (category: string) => void;
}

export default function Category({ category, setCategory }: CategoryProps) {
  return (
    <div className="mb-4 w-full">
      <label className="block text-sm font-medium text-gray-700">
        Category
      </label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
      >
        <option value="" disabled>
          Select a category
        </option>
        <option value="research">Research</option>
        <option value="design">Design</option>
        <option value="bug">Bug</option>
        <option value="feedback">Feedback</option>
      </select>
    </div>
  );
}
