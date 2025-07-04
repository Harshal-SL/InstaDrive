import ApiTest from '../../components/Admin/ApiTest'

const ApiTestPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      <p className="mb-6 text-gray-600">
        This page allows you to test the connection to the backend API endpoints.
        Click the buttons below to test different API endpoints.
      </p>
      
      <ApiTest />
    </div>
  )
}

export default ApiTestPage
