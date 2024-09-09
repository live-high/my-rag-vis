'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Database, FileText, Search, Cpu } from 'lucide-react'

// Simple text embedding function
const simpleEmbedding = (text: string, dimensions: number): number[] => {
  const hash = text.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0) | 0
  }, 0)
  return Array.from({ length: dimensions }, (_, i) => (Math.sin(hash * i) + 1) / 2)
}

// Cosine similarity function
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

type IndexEntry = {
  id: number
  text: string
  vector: number[]
}

const AdvancedRAGSystem: React.FC = () => {
  const [text, setText] = useState<string>("RAG systems combine retrieval and generation for accurate AI responses. Vector databases enable efficient similarity search. Embedding models convert text to numerical vectors. Large Language Models use retrieved context to generate informed answers. RAG improves AI output by grounding responses in relevant information.")
  const [chunkSize, setChunkSize] = useState<number>(20)
  const [vectorDimensions, setVectorDimensions] = useState<number>(4)
  const [indexingMethod, setIndexingMethod] = useState<string>("hashmap")
  const [chunks, setChunks] = useState<string[]>([])
  const [vectors, setVectors] = useState<number[][]>([])
  const [index, setIndex] = useState<IndexEntry[]>([])
  const [query, setQuery] = useState<string>("")
  const [queryVector, setQueryVector] = useState<number[]>([])
  const [retrievedDocs, setRetrievedDocs] = useState<IndexEntry[]>([])
  const [generatedAnswer, setGeneratedAnswer] = useState<string>("")

  const processText = useCallback(() => {
    const newChunks = text.split('.').filter(s => s.trim().length > 0)
    setChunks(newChunks)

    const newVectors = newChunks.map(chunk => simpleEmbedding(chunk, vectorDimensions))
    setVectors(newVectors)

    const newIndex = newChunks.map((chunk, i) => ({
      id: i,
      text: chunk,
      vector: newVectors[i]
    }))
    setIndex(newIndex)
  }, [text, vectorDimensions])

  useEffect(() => {
    processText()
  }, [processText])

  const handleQuery = () => {
    const qVector = simpleEmbedding(query, vectorDimensions)
    setQueryVector(qVector)

    const rankedDocs = index
      .map(entry => ({
        ...entry,
        similarity: cosineSimilarity(qVector, entry.vector)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)

    setRetrievedDocs(rankedDocs)

    // Simulate answer generation
    setTimeout(() => {
      const context = rankedDocs.map(doc => doc.text).join(' ')
      setGeneratedAnswer(`Based on the retrieved documents, here's an answer to "${query}": The query is related to ${context}. This information suggests that RAG systems are crucial for improving AI responses by leveraging efficient retrieval methods and large language models.`)
    }, 1500)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800">Advanced RAG System Visualization</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Input Text</h2>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter text to index"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Parameters</h2>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 w-32">Vector Dimensions:</span>
          <Slider
            value={[vectorDimensions]}
            onValueChange={(value) => setVectorDimensions(value[0])}
            min={2}
            max={8}
            step={1}
            className="w-64"
          />
          <span>{vectorDimensions}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 w-32">Indexing Method:</span>
          <Select value={indexingMethod} onValueChange={setIndexingMethod}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select indexing method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hashmap">Hash Map</SelectItem>
              <SelectItem value="tree">Tree-based</SelectItem>
              <SelectItem value="hnsw">HNSW</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">Indexing Process Visualization</h2>
        
        <div className="flex items-center justify-between">
          <div className="w-1/4 p-4 bg-blue-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">Text Chunking</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {chunks.map((chunk, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-2 bg-white rounded shadow"
                >
                  {chunk}
                </motion.div>
              ))}
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={24} />
          <div className="w-1/4 p-4 bg-green-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-green-800">Vectorization</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {vectors.map((vector, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-2 bg-white rounded shadow"
                >
                  [{vector.map(v => v.toFixed(2)).join(', ')}]
                </motion.div>
              ))}
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={24} />
          <div className="w-1/4 p-4 bg-yellow-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">Indexing</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {index.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-2 bg-white rounded shadow"
                >
                  ID: {entry.id}, Text: {entry.text.substring(0, 20)}...
                </motion.div>
              ))}
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={24} />
          <div className="w-1/4 p-4 bg-purple-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-purple-800">Index Storage</h3>
            <div className="flex justify-center items-center h-full">
              <Database className="text-purple-500" size={48} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">Retrieval Process</h2>
        <div className="flex items-center space-x-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow p-2 border rounded"
            placeholder="Enter your query"
          />
          <Button onClick={handleQuery} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Search
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="w-1/4 p-4 bg-blue-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">Query Vectorization</h3>
            <AnimatePresence>
              {queryVector.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-2 bg-white rounded shadow"
                >
                  [{queryVector.map(v => v.toFixed(2)).join(', ')}]
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ChevronRight className="text-gray-400" size={24} />
          <div className="w-1/4 p-4 bg-green-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-green-800">Vector Similarity</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {retrievedDocs.map((doc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-2 bg-white rounded shadow"
                >
                  ID: {doc.id}, Similarity: {doc.similarity.toFixed(4)}
                </motion.div>
              ))}
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={24} />
          <div className="w-1/4 p-4 bg-yellow-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">Retrieved Documents</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {retrievedDocs.map((doc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-2 bg-white rounded shadow"
                >
                  {doc.text}
                </motion.div>
              ))}
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={24} />
          <div className="w-1/4 p-4 bg-purple-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-purple-800">Answer Generation</h3>
            <div className="flex justify-center items-center h-full">
              <Cpu className="text-purple-500" size={48} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Generated Answer</h2>
        <div className="p-4 bg-green-50 rounded-lg">
          <AnimatePresence>
            {generatedAnswer && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-green-800"
              >
                {generatedAnswer}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AdvancedRAGSystem