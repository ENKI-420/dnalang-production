'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function EnvironmentalVisualization() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const dataCoreRef = useRef<THREE.Mesh | null>(null)
  const envDataFieldRef = useRef<THREE.LineSegments | null>(null)
  const analysisPlaneRef = useRef<THREE.Mesh | null>(null)
  const sensorPulsesRef = useRef<THREE.Group | null>(null)
  const shiftAiNodesRef = useRef<THREE.Points | null>(null)
  const shiftAiLinesRef = useRef<THREE.LineSegments | null>(null)
  const animationFrameId = useRef<number | null>(null)

  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: 800,
  })

  const isDragging = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })

  // LLM feature states
  const [environmentalInsight, setEnvironmentalInsight] = useState('')
  const [ecologicalScenario, setEcologicalScenario] = useState('')
  const [sustainableApplication, setSustainableApplication] = useState('')
  const [secureDataLog, setSecureDataLog] = useState('')
  const [bioSensorConcept, setBioSensorConcept] = useState('')
  const [dataAnomalyReport, setDataAnomalyReport] = useState('')
  const [modelIntegrationProtocol, setModelIntegrationProtocol] = useState('')
  const [fallbackResponse, setFallbackResponse] = useState('')

  const [isLoadingInsight, setIsLoadingInsight] = useState(false)
  const [isLoadingScenario, setIsLoadingScenario] = useState(false)
  const [isLoadingApplication, setIsLoadingApplication] = useState(false)
  const [isLoadingLog, setIsLoadingLog] = useState(false)
  const [isLoadingBio, setIsLoadingBio] = useState(false)
  const [isLoadingAnomaly, setIsLoadingAnomaly] = useState(false)
  const [isLoadingProtocol, setIsLoadingProtocol] = useState(false)

  const [llmError, setLlmError] = useState('')
  const [semanticScore, setSemanticScore] = useState<number | null>(null)
  const [contextConfidence, setContextConfidence] = useState<string | null>(null)

  // Function to create abstract data core texture
  const createDataCoreTexture = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.Texture()

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#021002')
    gradient.addColorStop(0.5, '#0a2a0a')
    gradient.addColorStop(1, '#1a4a1a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Circuit patterns
    ctx.strokeStyle = '#22ff22'
    ctx.lineWidth = 1.0
    for (let i = 0; i < 70; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }

    // Data points
    ctx.fillStyle = '#00ffff'
    for (let i = 0; i < 150; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  // Function to call Gemini API
  const callGeminiAPI = async (
    prompt: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setLlmError('')
    setLoading(true)
    setter('')
    setFallbackResponse('')
    setSemanticScore(null)
    setContextConfidence(null)

    try {
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }]
      const payload = { contents: chatHistory }
      const apiKey = "AIzaSyA2MZWrBvTOWuAggxlRTlmzVwMBG7nHkeo"
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      let generatedText = ''
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        generatedText = result.candidates[0].content.parts[0].text
        setter(generatedText)

        // Simulate semantic scoring
        const simulatedScore = Math.floor(Math.random() * 101)
        setSemanticScore(simulatedScore)

        let confidence = 'High'
        if (simulatedScore < 70) confidence = 'Medium'
        if (simulatedScore < 40) confidence = 'Low'
        setContextConfidence(confidence)

        // Automatic fallback if confidence is low
        if (confidence === 'Low') {
          const fallbackPrompt = `The previous response had low confidence. Please provide a more general overview or simplified explanation of: "${prompt.substring(0, 80)}..."`
          await callGeminiAPI(fallbackPrompt, setFallbackResponse, setLoading)
        }
      } else {
        setLlmError('Failed to generate response. Please try again.')
        console.error('Gemini API response format unexpected:', result)
      }
    } catch (error) {
      setLlmError('Error communicating with Gemini API. Please check your network or try again.')
      console.error('Gemini API fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // LLM Handlers
  const handleGenerateInsight = () => {
    const prompt = "Generate a concise insight (approx. 50-80 words) on how SHIFT-AI's agentic inference capabilities can optimize environmental impact assessments and resource allocation for complex industrial projects, ensuring compliance and sustainability."
    callGeminiAPI(prompt, setEnvironmentalInsight, setIsLoadingInsight)
  }

  const handleGenerateThoughtExperiment = () => {
    const prompt = "Propose a compelling thought experiment (approx. 60-100 words) detailing the ethical and technical challenges of deploying autonomous AI agents via SHIFT-AI's MCP SDK for real-time ecological remediation in highly sensitive, remote environmental zones, balancing intervention with natural recovery processes."
    callGeminiAPI(prompt, setEcologicalScenario, setIsLoadingScenario)
  }

  const handleGenerateIndustryApplication = () => {
    const prompt = "Describe an innovative application (approx. 70-120 words) for SHIFT-AI within the enterprise sector, focusing on how its collaborative AI workflows can streamline global supply chain sustainability audits, predict environmental risks, and recommend optimized, eco-friendly logistics pathways."
    callGeminiAPI(prompt, setSustainableApplication, setIsLoadingApplication)
  }

  const handleGenerateInterdimensionalLog = () => {
    const prompt = "Simulate a brief, technical log entry (approx. 40-70 words) from a SHIFT-AI system, detailing a successful real-time data ingestion and contextualization event via the IRIS-AI MCP SDK, noting the integration of disparate environmental sensor feeds and the identification of a novel pollution signature."
    callGeminiAPI(prompt, setSecureDataLog, setIsLoadingLog)
  }

  const handleGenerateBioCybernetics = () => {
    const prompt = "Outline a conceptual framework (approx. 50-90 words) for bio-integrated sensor networks, leveraging SHIFT-AI's capabilities for ultra-sensitive environmental contaminant detection and predictive modeling of ecosystem health. Focus on real-time adaptive responses and integration with smart city infrastructure."
    callGeminiAPI(prompt, setBioSensorConcept, setIsLoadingBio)
  }

  const handleAnalyzeFieldAnomaly = () => {
    const prompt = "Provide a concise analytical report (approx. 70-100 words) on a theoretical data anomaly detected by SHIFT-AI within a complex environmental dataset, detailing its potential impact on climate modeling accuracy, the integrity of a carbon credit verification system, and proposed AI-driven mitigation strategies."
    callGeminiAPI(prompt, setDataAnomalyReport, setIsLoadingAnomaly)
  }

  const handleArchitectDimensionalGateway = () => {
    const prompt = "Describe a conceptual 'Data Synthesis Gateway' protocol (approx. 80-120 words) for harmonizing vast, multi-source environmental data using SHIFT-AI's IRIS-AI MCP SDK. Focus on its role in enabling secure, scalable data fusion for comprehensive environmental intelligence across defense, research, and enterprise sectors."
    callGeminiAPI(prompt, setModelIntegrationProtocol, setIsLoadingProtocol)
  }

  // Initialize the scene
  useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      windowDimensions.width / windowDimensions.height,
      0.1,
      1000
    )
    camera.position.z = 5
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(windowDimensions.width, windowDimensions.height)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(0, 1, 1)
    scene.add(directionalLight)

    // Data Core (Icosahedron)
    const coreRadius = 1.8
    const dataCoreGeometry = new THREE.IcosahedronGeometry(coreRadius, 1)
    const dataCoreTexture = createDataCoreTexture()

    const initialDataCorePositions = new Float32Array(dataCoreGeometry.attributes.position.array.length)
    for(let i=0; i<dataCoreGeometry.attributes.position.array.length; i++) {
      initialDataCorePositions[i] = dataCoreGeometry.attributes.position.array[i]
    }
    dataCoreGeometry.setAttribute('initialPosition', new THREE.BufferAttribute(initialDataCorePositions, 3))

    const dataCoreMaterial = new THREE.MeshPhongMaterial({
      map: dataCoreTexture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      specular: 0x050505,
      shininess: 30,
      blending: THREE.AdditiveBlending,
    })
    const dataCore = new THREE.Mesh(dataCoreGeometry, dataCoreMaterial)
    scene.add(dataCore)
    dataCoreRef.current = dataCore

    // Internal Data Flow Lines
    const internalFlowGeometry = new THREE.EdgesGeometry(dataCoreGeometry)
    const internalFlowMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      linewidth: 2,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })
    const internalFlowLines = new THREE.LineSegments(internalFlowGeometry, internalFlowMaterial)
    dataCore.add(internalFlowLines)

    // Environmental Data Field
    const envFieldGridSize = 18
    const envFieldResolution = 25
    const envFieldPositions: number[] = []
    const envFieldColors: number[] = []
    const envFieldColor = new THREE.Color()

    for (let x = 0; x <= envFieldResolution; x++) {
      for (let y = 0; y <= envFieldResolution; y++) {
        envFieldPositions.push(
          (x / envFieldResolution - 0.5) * envFieldGridSize,
          (y / envFieldResolution - 0.5) * envFieldGridSize,
          -envFieldGridSize / 2
        )
        envFieldPositions.push(
          (x / envFieldResolution - 0.5) * envFieldGridSize,
          (y / envFieldResolution - 0.5) * envFieldGridSize,
          envFieldGridSize / 2
        )
        envFieldColor.setHSL(0.35 + Math.random() * 0.1, 0.8, 0.5)
        envFieldColors.push(envFieldColor.r, envFieldColor.g, envFieldColor.b, envFieldColor.r, envFieldColor.g, envFieldColor.b)
      }
    }

    const envFieldGeometry = new THREE.BufferGeometry()
    envFieldGeometry.setAttribute('position', new THREE.Float32BufferAttribute(envFieldPositions, 3))
    envFieldGeometry.setAttribute('color', new THREE.Float32BufferAttribute(envFieldColors, 3))

    const initialEnvFieldColors = new Float32Array(envFieldColors.length)
    for(let i=0; i<envFieldColors.length; i++) initialEnvFieldColors[i] = envFieldColors[i]
    envFieldGeometry.setAttribute('initialColor', new THREE.BufferAttribute(initialEnvFieldColors, 3))

    const envFieldMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    })

    envDataFieldRef.current = new THREE.LineSegments(envFieldGeometry, envFieldMaterial)
    scene.add(envDataFieldRef.current)

    // Analysis Plane
    const analysisPlaneGeometry = new THREE.PlaneGeometry(12, 12)
    const analysisPlaneMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xeeffff,
      metalness: 0.0,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 0.8,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    analysisPlaneRef.current = new THREE.Mesh(analysisPlaneGeometry, analysisPlaneMaterial)
    analysisPlaneRef.current.rotation.x = Math.PI / 2
    analysisPlaneRef.current.position.y = -4
    scene.add(analysisPlaneRef.current)

    // Sensor Pulses
    const sensorPulseCount = 15
    const sensorPulses = new THREE.Group()
    const sensorPulseMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    })
    const pulseLength = 8

    for (let i = 0; i < sensorPulseCount; i++) {
      const pulseGeometry = new THREE.CylinderGeometry(0.03, 0.03, pulseLength, 8)
      pulseGeometry.translate(0, pulseLength / 2, 0)
      const pulse = new THREE.Mesh(pulseGeometry, sensorPulseMaterial) as THREE.Mesh & { initialPosition?: THREE.Vector3; rotationOffset?: number }
      pulse.initialPosition = new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18
      )
      pulse.lookAt(dataCore.position)
      pulse.rotationOffset = Math.random() * Math.PI * 2
      sensorPulses.add(pulse)
    }
    sensorPulsesRef.current = sensorPulses
    scene.add(sensorPulsesRef.current)

    // SHIFT-AI Nodes and Lines
    const shiftAiNodeCount = 120
    const shiftAiNodePositions: number[] = []
    const shiftAiLinePositions: number[] = []
    const shiftAiNodeColor = new THREE.Color(0x00ee00)

    const shiftAiNodes: THREE.Vector3[] = []
    for (let i = 0; i < shiftAiNodeCount; i++) {
      const x = (Math.random() - 0.5) * 15
      const y = (Math.random() - 0.5) * 15
      const z = (Math.random() - 0.5) * 15
      shiftAiNodePositions.push(x, y, z)
      shiftAiNodes.push(new THREE.Vector3(x, y, z))
    }

    for (let i = 0; i < shiftAiNodeCount; i++) {
      for (let j = i + 1; j < shiftAiNodeCount; j++) {
        if (shiftAiNodes[i].distanceTo(shiftAiNodes[j]) < 3) {
          shiftAiLinePositions.push(shiftAiNodes[i].x, shiftAiNodes[i].y, shiftAiNodes[i].z)
          shiftAiLinePositions.push(shiftAiNodes[j].x, shiftAiNodes[j].y, shiftAiNodes[j].z)
        }
      }
    }

    const shiftAiNodesGeometry = new THREE.BufferGeometry()
    shiftAiNodesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shiftAiNodePositions, 3))
    const shiftAiNodesMaterial = new THREE.PointsMaterial({
      color: shiftAiNodeColor,
      size: 0.2,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false
    })
    shiftAiNodesRef.current = new THREE.Points(shiftAiNodesGeometry, shiftAiNodesMaterial)
    scene.add(shiftAiNodesRef.current)

    const shiftAiLinesGeometry = new THREE.BufferGeometry()
    shiftAiLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shiftAiLinePositions, 3))
    const shiftAiLinesMaterial = new THREE.LineBasicMaterial({
      color: 0x009900,
      linewidth: 1.8,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    })
    shiftAiLinesRef.current = new THREE.LineSegments(shiftAiLinesGeometry, shiftAiLinesMaterial)
    scene.add(shiftAiLinesRef.current)

    // Mouse event handlers
    const onMouseDown = (event: MouseEvent) => {
      isDragging.current = true
      previousMousePosition.current = { x: event.clientX, y: event.clientY }
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging.current) return
      const deltaX = event.clientX - previousMousePosition.current.x
      const deltaY = event.clientY - previousMousePosition.current.y

      const elementsToRotate = [
        dataCoreRef.current,
        envDataFieldRef.current,
        analysisPlaneRef.current,
        sensorPulsesRef.current,
        shiftAiNodesRef.current,
        shiftAiLinesRef.current
      ]
      elementsToRotate.forEach(element => {
        if (element) {
          element.rotation.y += deltaX * 0.003
          element.rotation.x += deltaY * 0.003
        }
      })
      previousMousePosition.current = { x: event.clientX, y: event.clientY }
    }

    const onMouseUp = () => {
      isDragging.current = false
    }

    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('mouseup', onMouseUp)
    renderer.domElement.addEventListener('mouseleave', onMouseUp)

    // Animation loop
    const animate = () => {
      const time = Date.now() * 0.001

      // Data Core Animation
      if (dataCoreRef.current) {
        dataCoreRef.current.rotation.y += 0.0008
        dataCoreRef.current.rotation.x += 0.0004

        const positions = (dataCoreRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array
        const initialPositions = (dataCoreRef.current.geometry.attributes as any).initialPosition

        const distortionStrength = 0.08
        for (let i = 0; i < positions.length; i += 3) {
          const originalX = initialPositions.array[i]
          const originalY = initialPositions.array[i + 1]
          const originalZ = initialPositions.array[i + 2]

          positions[i] = originalX + Math.sin(time * 3 + originalY * 2) * distortionStrength
          positions[i + 1] = originalY + Math.cos(time * 2.5 + originalX * 2) * distortionStrength
          positions[i + 2] = originalZ + Math.sin(time * 3.5 + originalZ * 2) * distortionStrength
        }
        dataCoreRef.current.geometry.attributes.position.needsUpdate = true
        dataCoreRef.current.geometry.computeVertexNormals()

        // Internal lines pulsation
        if (dataCoreRef.current.children[0]) {
          const child = dataCoreRef.current.children[0] as THREE.LineSegments
          if (child.material) {
            const material = child.material as THREE.LineBasicMaterial
            material.opacity = 0.4 + Math.sin(time * 5) * 0.2
            material.color.setHSL(0.33 + Math.sin(time * 3) * 0.05, 1, 0.7)
          }
        }

        // Core material color shift
        const phase = (time * 0.5) % (2 * Math.PI)
        const r = Math.sin(phase + 0) * 0.2 + 0.8
        const g = Math.sin(phase + Math.PI * 0.8) * 0.2 + 0.8
        const b = Math.sin(phase + Math.PI * 1.6) * 0.2 + 0.8
        dataCoreRef.current.material.color.setRGB(r, g, b).lerp(new THREE.Color(0x00ff00), 0.2)
        dataCoreRef.current.material.opacity = 0.85 + Math.sin(time * 2.5) * 0.05
      }

      // Environmental Data Field Animation
      if (envDataFieldRef.current) {
        envDataFieldRef.current.rotation.y += 0.0003
        envDataFieldRef.current.rotation.x += 0.0001

        const positions = (envDataFieldRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array
        const colors = (envDataFieldRef.current.geometry.attributes.color as THREE.BufferAttribute).array as Float32Array
        const initialColors = (envDataFieldRef.current.geometry.attributes as any).initialColor

        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += Math.sin(time * 1.5 + i * 0.05) * 0.005
          positions[i+1] += Math.cos(time * 1.8 + i * 0.06) * 0.005
          positions[i+2] += Math.sin(time * 2.1 + i * 0.07) * 0.005

          const pulse = (Math.sin(time * 3 + i * 0.01) * 0.5 + 0.5)
          colors[i] = initialColors.array[i] * pulse * 1.2
          colors[i+1] = initialColors.array[i+1] * pulse * 1.2
          colors[i+2] = initialColors.array[i+2] * pulse * 1.2
        }
        envDataFieldRef.current.geometry.attributes.position.needsUpdate = true
        envDataFieldRef.current.geometry.attributes.color.needsUpdate = true
        envDataFieldRef.current.material.opacity = 0.18 + Math.sin(time * 2) * 0.07
      }

      // Analysis Plane Animation
      if (analysisPlaneRef.current) {
        analysisPlaneRef.current.position.y = -4 + Math.sin(time * 0.6) * 0.1
        analysisPlaneRef.current.rotation.z = Math.sin(time * 0.4) * 0.02

        analysisPlaneRef.current.material.opacity = 0.12 + Math.sin(time * 3) * 0.06
        const colorShift = (Math.sin(time * 2) * 0.5 + 0.5) * 0.05
        analysisPlaneRef.current.material.color.setHSL(0.55 + colorShift, 0.5, 0.95)
      }

      // Sensor Pulses Animation
      if (sensorPulsesRef.current) {
        sensorPulsesRef.current.children.forEach((pulse, index) => {
          const typedPulse = pulse as THREE.Mesh & { rotationOffset?: number }
          const pulseSpeed = 0.3 + Math.random() * 0.3
          const pulseProgress = (time * pulseSpeed + (typedPulse.rotationOffset || 0)) % (pulseLength * 2)

          if (pulseProgress < pulseLength) {
            pulse.scale.y = pulseProgress / pulseLength
            const material = (pulse as THREE.Mesh).material as THREE.MeshBasicMaterial
            material.opacity = Math.min(pulse.scale.y * 1.5, 0.7)
            pulse.position.y = (pulseProgress - pulseLength / 2)
          } else {
            pulse.scale.y = 1 - ((pulseProgress - pulseLength) / pulseLength)
            const material = (pulse as THREE.Mesh).material as THREE.MeshBasicMaterial
            material.opacity = Math.max(0, (1 - pulse.scale.y) * 0.6)
            pulse.position.y = -(pulseProgress - pulseLength * 1.5)
          }
          const pulseColorShift = (Math.sin(time * 6 + index) * 0.5 + 0.5)
          const material = (pulse as THREE.Mesh).material as THREE.MeshBasicMaterial
          material.color.setHSL(0.5 + pulseColorShift * 0.1, 1, 0.8)
        })
      }

      // SHIFT-AI Nodes and Lines Animation
      if (shiftAiNodesRef.current && shiftAiLinesRef.current) {
        shiftAiNodesRef.current.rotation.y += 0.0005
        shiftAiLinesRef.current.rotation.y += 0.0005

        const nodesMaterial = shiftAiNodesRef.current.material as THREE.PointsMaterial
        nodesMaterial.size = 0.2 + Math.sin(time * 7) * 0.05
        nodesMaterial.opacity = 0.8 + Math.sin(time * 6) * 0.1
        const nodeHueShift = (Math.sin(time * 3) * 0.5 + 0.5) * 0.03
        nodesMaterial.color.setHSL(0.33 + nodeHueShift, 1, 0.7)

        const linesMaterial = shiftAiLinesRef.current.material as THREE.LineBasicMaterial
        linesMaterial.opacity = 0.4 + Math.cos(time * 8) * 0.08
        const lineFlowHueShift = (Math.sin(time * 3.5) * 0.5 + 0.5) * 0.05
        linesMaterial.color.setHSL(0.33 + lineFlowHueShift, 1, 0.6)
      }

      renderer.render(scene, camera)
      animationFrameId.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      if (typeof window === 'undefined') return
      const { innerWidth, innerHeight } = window
      const newHeight = Math.max(innerHeight * 0.6, 600)
      setWindowDimensions({ width: innerWidth, height: newHeight })
      camera.aspect = innerWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(innerWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Set initial size

    // Cleanup
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('mouseup', onMouseUp)
      renderer.domElement.removeEventListener('mouseleave', onMouseUp)
      window.removeEventListener('resize', handleResize)

      // Dispose geometries and materials
      dataCoreTexture.dispose()
      dataCoreGeometry.dispose()
      dataCoreMaterial.dispose()
      internalFlowGeometry.dispose()
      internalFlowMaterial.dispose()
      if (envDataFieldRef.current?.geometry) envDataFieldRef.current.geometry.dispose()
      if (envDataFieldRef.current?.material) (envDataFieldRef.current.material as THREE.Material).dispose()
      if (analysisPlaneRef.current?.geometry) analysisPlaneRef.current.geometry.dispose()
      if (analysisPlaneRef.current?.material) (analysisPlaneRef.current.material as THREE.Material).dispose()
      if (sensorPulsesRef.current) {
        sensorPulsesRef.current.children.forEach(pulse => {
          const mesh = pulse as THREE.Mesh
          if (mesh.geometry) mesh.geometry.dispose()
          if (mesh.material) (mesh.material as THREE.Material).dispose()
        })
      }
      if (shiftAiNodesRef.current?.geometry) shiftAiNodesRef.current.geometry.dispose()
      if (shiftAiNodesRef.current?.material) (shiftAiNodesRef.current.material as THREE.Material).dispose()
      if (shiftAiLinesRef.current?.geometry) shiftAiLinesRef.current.geometry.dispose()
      if (shiftAiLinesRef.current?.material) (shiftAiLinesRef.current.material as THREE.Material).dispose()

      if (scene) {
        scene.remove(dataCore)
        if (envDataFieldRef.current) scene.remove(envDataFieldRef.current)
        if (analysisPlaneRef.current) scene.remove(analysisPlaneRef.current)
        if (sensorPulsesRef.current) scene.remove(sensorPulsesRef.current)
        if (shiftAiNodesRef.current) scene.remove(shiftAiNodesRef.current)
        if (shiftAiLinesRef.current) scene.remove(shiftAiLinesRef.current)
      }
      renderer.dispose()
    }
  }, [createDataCoreTexture, windowDimensions])

  return (
    <div className="relative w-full" style={{ height: windowDimensions.height }}>
      {/* 3D Canvas */}
      <div ref={mountRef} className="absolute top-0 left-0 w-full h-full" style={{ background: 'linear-gradient(to bottom, #0a1a0a, #000000)' }} />

      {/* Overlay Controls */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="container mx-auto px-6 py-8 h-full flex flex-col justify-between pointer-events-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              SHIFT-AI Environmental Data Core
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto drop-shadow-md">
              Real-time quantum organism consciousness monitoring and environmental intelligence synthesis
            </p>
          </div>

          {/* AI Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Button
              onClick={handleGenerateInsight}
              disabled={isLoadingInsight}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg"
              size="sm"
            >
              {isLoadingInsight ? 'Generating...' : 'AI Insight 💡'}
            </Button>
            <Button
              onClick={handleGenerateThoughtExperiment}
              disabled={isLoadingScenario}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
              size="sm"
            >
              {isLoadingScenario ? 'Generating...' : 'AI Scenario 🧠'}
            </Button>
            <Button
              onClick={handleGenerateIndustryApplication}
              disabled={isLoadingApplication}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-lg"
              size="sm"
            >
              {isLoadingApplication ? 'Generating...' : 'Enterprise AI 🏢'}
            </Button>
            <Button
              onClick={handleGenerateInterdimensionalLog}
              disabled={isLoadingLog}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold shadow-lg"
              size="sm"
            >
              {isLoadingLog ? 'Generating...' : 'MCP Log 💾'}
            </Button>
            <Button
              onClick={handleGenerateBioCybernetics}
              disabled={isLoadingBio}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg"
              size="sm"
            >
              {isLoadingBio ? 'Generating...' : 'Agentic AI 🤖'}
            </Button>
            <Button
              onClick={handleAnalyzeFieldAnomaly}
              disabled={isLoadingAnomaly}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg"
              size="sm"
            >
              {isLoadingAnomaly ? 'Generating...' : 'Anomaly 🚨'}
            </Button>
            <Button
              onClick={handleArchitectDimensionalGateway}
              disabled={isLoadingProtocol}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg"
              size="sm"
            >
              {isLoadingProtocol ? 'Generating...' : 'Integration 🔗'}
            </Button>
          </div>

          {/* AI Output Display */}
          {llmError && (
            <Card className="p-4 bg-red-900/80 backdrop-blur-sm border-red-500 text-white max-w-4xl mx-auto mb-4">
              <p className="text-center">{llmError}</p>
            </Card>
          )}

          {(semanticScore !== null || contextConfidence !== null) && (
            <Card className="p-4 bg-gray-900/80 backdrop-blur-sm border-gray-700 text-white max-w-md mx-auto mb-4">
              <h3 className="font-semibold text-lg mb-2 text-blue-300">LLM Metrics:</h3>
              <div className="space-y-1">
                <p>Semantic Score: <span className="font-bold">{semanticScore !== null ? semanticScore : 'N/A'}</span></p>
                <p>
                  Context Confidence:{' '}
                  <span className={`font-bold ${contextConfidence === 'Low' ? 'text-red-400' : contextConfidence === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {contextConfidence !== null ? contextConfidence : 'N/A'}
                  </span>
                </p>
              </div>
            </Card>
          )}

          {fallbackResponse && (
            <Card className="p-4 bg-yellow-900/80 backdrop-blur-sm border-yellow-700 text-white max-w-4xl mx-auto mb-4">
              <h3 className="font-semibold text-lg mb-2 text-yellow-300">Fallback Response (Low Confidence):</h3>
              <p>{fallbackResponse}</p>
            </Card>
          )}

          {/* AI Generated Content Grid */}
          {(environmentalInsight || ecologicalScenario || sustainableApplication || secureDataLog || bioSensorConcept || dataAnomalyReport || modelIntegrationProtocol) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
              {environmentalInsight && (
                <Card className="p-4 bg-gray-900/80 backdrop-blur-sm border-green-500/50 text-white">
                  <h3 className="font-semibold text-lg mb-2 text-green-300">AI Insight:</h3>
                  <p className="text-sm">{environmentalInsight}</p>
                </Card>
              )}
              {ecologicalScenario && (
                <Card className="p-4 bg-gray-900/80 backdrop-blur-sm border-blue-500/50 text-white">
                  <h3 className="font-semibold text-lg mb-2 text-blue-300">AI Scenario:</h3>
                  <p className="text-sm">{ecologicalScenario}</p>
                </Card>
              )}
              {sustainableApplication && (
                <Card className="p-4 bg-gray-900/80 backdrop-blur-sm border-teal-500/50 text-white">
                  <h3 className="font-semibold text-lg mb-2 text-teal-300">Enterprise AI:</h3>
                  <p className="text-sm">{sustainableApplication}</p>
                </Card>
              )}
              {secureDataLog && (
                <Card className="p-4 bg-gray-900/80 backdrop-blur-sm border-yellow-500/50 text-white">
                  <h3 className="font-semibold text-lg mb-2 text-yellow-300">MCP Log:</h3>
                  <p className="text-sm">{secureDataLog}</p>
                </Card>
              )}
              {bioSensorConcept && (
                <Card className="p-4 bg-gray-900/80 backdrop-blur-sm border-purple-500/50 text-white">
                  <h3 className="font-semibold text-lg mb-2 text-purple-300">Agentic AI:</h3>
                  <p className="text-sm">{bioSensorConcept}</p>
                </Card>
              )}
              {dataAnomalyReport && (
                <Card className="p-4 bg-gray-900/80 backdrop-blur-sm border-red-500/50 text-white">
                  <h3 className="font-semibold text-lg mb-2 text-red-300">Anomaly Report:</h3>
                  <p className="text-sm">{dataAnomalyReport}</p>
                </Card>
              )}
              {modelIntegrationProtocol && (
                <Card className="p-4 bg-gray-900/80 backdrop-blur-sm border-indigo-500/50 text-white">
                  <h3 className="font-semibold text-lg mb-2 text-indigo-300">Integration Protocol:</h3>
                  <p className="text-sm">{modelIntegrationProtocol}</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
